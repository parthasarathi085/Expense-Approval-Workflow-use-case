from flask import Flask, request, jsonify
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import firebase_admin
from firebase_admin import credentials, firestore, messaging, exceptions

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()


approver_ref = db.collection("GenAI Expense Workflow").document("Approvers")
approver_leave_ref = db.collection("GenAI Expense Workflow").document("Approvers_leave")
emp_ref = db.collection("GenAI Expense Workflow").document("Employees")
post_exp__ref = db.collection("GenAI Expense Workflow").document("Post_expense")

# fcm services
admin_fcm_ref = db.collection("Admin").document("FCMs")
def get_fcm_token(user_id):
    try:
        doc = admin_fcm_ref.get()
        
        if doc.exists:
            fcm_tokens = doc.to_dict().get('fcm', {})
            print(fcm_tokens)
            return fcm_tokens.get(user_id)
        else:
            print("Document does not exist.")
            return None

    except Exception as e:
        print(f"Error retrieving FCM token: {e}")
        return None

admin_token = get_fcm_token("sarathipartha085@gmail")
print(admin_token)

def send_fcm_notification(data=None):
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title="Xp Flow",
                body="Xp Flow status updating",
            ),
            data=data,
            token=admin_token
        )

        response = messaging.send(message)
        print('Successfully sent message:', response)

    except exceptions.FirebaseError as e:
        print('Failed to send message:', e)

def get_mobile_number(user):
    try:
        doc = emp_ref.get()
        
        if doc.exists:
            fcm_tokens = doc.to_dict().get(user, {})
            return fcm_tokens.get("number")
        else:
            print("Document does not exist.")
            return None

    except Exception as e:
        print(f"Error retrieving FCM token: {e}")
        return None


# message = "Dear " + "Manager" + ":\n" + "You have a new expense submission from " + "sara" + ".\n Review the expenses."
# data = {"message_text" : message , "number" : "8144663240"}
# send_fcm_notification(data)



approver_leave_data = approver_leave_ref.get()
approver_leave_status = {
    'Manager': False,
    'Senior Manager': False,
    'Director': False,
    'VP': False,
    'CFO': False
}
print("==========Before update=========\n",approver_leave_status,"\n====================")
if approver_leave_data.exists:
    approver_leave_status.update(approver_leave_data.to_dict())
    print("==========After update update=========\n",approver_leave_status,"\n====================")

# {'Manager': False, 'Senior Manager': True, 'Director': True, 'VP': False, 'CFO': False}

# Function to check if an approver is on vacation
def is_on_vacation(approver):
    return approver_leave_status.get(approver)

# Function to find the next available approver based on vacation status
def find_next_available_approver(possible_approvers):
    for approver in possible_approvers:
        if not is_on_vacation(approver):
            return approver
    return 'No approver available'


# Load the models
model_3 = joblib.load('feature_3_model.pkl')
model_2 = joblib.load('feature_2_model.pkl')

# Load the encoders (reused from your training process)
le_category = LabelEncoder().fit(['Travel', 'Meals', 'Supplies', 'Entertainment', 'Training', 'Miscellaneous'])
le_subcategory = LabelEncoder().fit(['Airfare', 'Lodging', 'Transportation', 'Breakfast', 'Lunch', 'Dinner', 'Snacks',
                                     'Office Supplies', 'Hardware', 'Software', 'Team Outing', 'Client Entertainment', 'Gifts',
                                     'Courses', 'Conferences', 'Certifications', 'Others', 'Subscriptions', 'Donations'])
le_expense_type = LabelEncoder().fit(['Business', 'Personal'])
le_department = LabelEncoder().fit(['Sales', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations'])
le_position = LabelEncoder().fit(['Manager', 'Engineer', 'Analyst', 'Executive', 'Coordinator'])
le_payment_method = LabelEncoder().fit(['Credit Card', 'Cash', 'Bank Transfer'])
le_receipt_provided = LabelEncoder().fit(['Yes', 'No'])
le_approver = LabelEncoder().fit(['Manager', 'Senior Manager', 'Director', 'VP', 'CFO'])
le_status = LabelEncoder().fit(['Pending', 'Approved'])

# Define approvers and their limits
approvers = [
    {'name': 'Manager', 'limit': 10000},
    {'name': 'Senior Manager', 'limit': 20000},
    {'name': 'Director', 'limit': 30000},
    {'name': 'VP', 'limit': 50000},
    {'name': 'CFO', 'limit': float('inf')}
]

# Function to determine the approvers based on the amount
def determine_approvers(amount):
    return [approver['name'] for approver in approvers if int(amount) <= approver['limit']]

# Encode categorical data for the model
def encode_features(df, encoders):
    features = df[['Amount', 'Category', 'Subcategory', 'Expense_Type', 'Department', 'Position', 'Payment_Method', 'Receipt_Provided']]
    for column, encoder in encoders.items():
        features[column] = encoder.transform(features[column])
    return features

# Predict approvers using the trained model
def predict_approvers(amount, category, subcategory, expense_type, department, position, payment_method, receipt_provided):
    # Encode the input data
    data = {
        'Amount': [amount],
        'Category': [category],
        'Subcategory': [subcategory],
        'Expense_Type': [expense_type],
        'Department': [department],
        'Position': [position],
        'Payment_Method': [payment_method],
        'Receipt_Provided': [receipt_provided]
    }
    input_df = pd.DataFrame(data)

    encoders = {
        'Category': le_category,
        'Subcategory': le_subcategory,
        'Expense_Type': le_expense_type,
        'Department': le_department,
        'Position': le_position,
        'Payment_Method': le_payment_method,
        'Receipt_Provided': le_receipt_provided
    }

    encoded_features = encode_features(input_df, encoders)
    approver_prediction = model_2.predict(encoded_features)
    approver_name = le_approver.inverse_transform(approver_prediction)[0]

    # Determine possible approvers based on amount
    possible_approvers = determine_approvers(amount)

    return approver_name, possible_approvers


@app.route('/predict_approver', methods=['POST'])
def predict_approver():
    data = request.json

    # Use get method to avoid KeyError
    amount = data.get('amount')
    category = data.get('expenseCategory')
    subcategory = data.get('expenseSubcategory')
    expense_type = data.get('expenseType')
    department = data.get('department')
    position = data.get('position')
    payment_method = data.get('paymentMethod')
    receipt_provided = data.get('receiptOption')

    # Check if the required fields are present
    if amount is None:
        return jsonify({"error": "amount field is required"}), 400
    if category is None:
        return jsonify({"error": "category field is required"}), 400
    if subcategory is None:
        return jsonify({"error": "subcategory field is required"}), 400
    if expense_type is None:
        return jsonify({"error": "expense_type field is required"}), 400
    if department is None:
        return jsonify({"error": "department field is required"}), 400
    if position is None:
        return jsonify({"error": "position field is required"}), 400
    if payment_method is None:
        return jsonify({"error": "payment_method field is required"}), 400
    if receipt_provided is None:
        return jsonify({"error": "receipt_provided field is required"}), 400

    approver_name, possible_approvers = predict_approvers(amount, category, subcategory, expense_type, department, position, payment_method, receipt_provided)

    return jsonify({
        "approver": approver_name,
        "possible_approvers": possible_approvers
    })


@app.route('/predict_approval', methods=['POST'])
def predict_approval():
    data = request.json
    
    # Check if the 'amount' key exists in the data
    if 'amount' not in data:
        return jsonify({"error": "Missing 'amount' in the request data"}), 400
    
    # Similarly check other keys that are required
    required_keys = ['expenseCategory', 'expenseSubcategory', 'expenseType', 'department', 'position', 'paymentMethod', 'receiptOption']
    missing_keys = [key for key in required_keys if key not in data]
    
    if missing_keys:
        return jsonify({"error": f"Missing keys in the request data: {', '.join(missing_keys)}"}), 400
    
    amount = data['amount']
    category_encoded = le_category.transform([data['expenseCategory']])[0]
    subcategory_encoded = le_subcategory.transform([data['expenseSubcategory']])[0]
    expense_type_encoded = le_expense_type.transform([data['expenseType']])[0]
    department_encoded = le_department.transform([data['department']])[0]
    position_encoded = le_position.transform([data['position']])[0]
    payment_method_encoded = le_payment_method.transform([data['paymentMethod']])[0]
    receipt_provided_encoded = le_receipt_provided.transform([data['receiptOption']])[0]

    prediction = model_3.predict([[amount, category_encoded, subcategory_encoded, expense_type_encoded, department_encoded,
                                   position_encoded, payment_method_encoded, receipt_provided_encoded]])
    return jsonify({"approval_status": le_status.inverse_transform(prediction)[0]})

# Function to listen for changes in the Firestore document
def listen_for_changes():

    approver_leave_data = approver_leave_ref.get()

    if approver_leave_data.exists:
        approver_leave_status.update(approver_leave_data.to_dict())

    def on_snapshot(doc_snapshot, changes, read_time):
        for doc in doc_snapshot:
            message_approvers = []
            # print(f"Received document snapshot: {doc.id}")
            data = doc.to_dict()

            print("========\n",data,"\n=========")

            for username, values in data.items():
                expenses = values.get("expenses")
                startdate = values.get("startdata")
                enddate = values.get("enddata")

                expenses_status = []
                count = 0
                if expenses:
                    for exp_val in expenses:
                        response_approval = app.test_client().post('/predict_approval', json=exp_val)
                        response_data = response_approval.get_json()
                        approval_status = response_data.get("approval_status") #Approved
                        if approval_status == "Pending":
                            response_approver = app.test_client().post('/predict_approver', json=exp_val)
                            approver = response_approver.get_json().get("approver").replace(" ","")
                            possible_approvers = response_approver.get_json().get("possible_approvers")
                                                        
                            if is_on_vacation(approver):
                                approver = find_next_available_approver(possible_approvers)
                                approver = approver.replace(" ","")

                            field_path = f"{approver}.pending"
                            
                            approver_ref.update({
                                field_path: firestore.ArrayUnion([{
                                    "username": f"{username}--{startdate}--{enddate}",
                                    "expenses": exp_val
                                }])
                            }) 

                            print(approver)
                            if approver not in message_approvers:
                                message_approvers.append(approver)
                        else :
                            count += 1


                        exp_val["status"] = approval_status
                        expenses_status.append(exp_val)
                        # print(response_approval)

                    batch = username.split("--")[0]
                    username = username.split("--")[1].replace("@","_")
                    # emp_path = f"{username}.xpenses.pending"
                    stat = "pending"

                    if count == len(expenses) :
                        stat = "approved"
                        # emp_path = f"{username}.xpenses.approved"

                    final_data = {"startdate": startdate, "enddate": enddate , "batchname": batch,"expenses" : expenses_status}
                
                    # emp_ref.update({
                    #     f"{emp_path}": {
                    #         f"{batch}--{startdate}--{enddate}" : final_data
                    #     }
                    # })

                    emp_ref.set({
                        username: {
                            "xpenses" : {
                                stat : {
                                    f"{batch}--{startdate}--{enddate}" : final_data 
                                }
                            }
                        }
                    }, merge = True)
            
                # print("=========\n",expenses_status)

                for msg_to in message_approvers:
                    number = get_mobile_number(msg_to)
                    if number != None:
                        message = "Dear " + msg_to + ":\n" + "You have a new expense submission from " + username + ".\n Review the expenses."
                        data = {"message_text" : message , "number" : "8144663240"}
                        send_fcm_notification(data)

            doc.reference.delete()
            print("==============================\nEverything is updated successfully...\n==============================")

    # Watch the document
    post_exp__ref.on_snapshot(on_snapshot)

    # Listen for changes in approver_leave_ref
    def on_approver_snapshot(doc_snapshot, changes, read_time):
        for doc in doc_snapshot:
            approver_leave_data = doc.to_dict()
            # Process approver leave data as needed
            print("==========Before update=========\n",approver_leave_status,"\n====================\n")
            approver_leave_status.update(approver_leave_data)
            print("==========After update update=========\n",approver_leave_status,"\n====================\n")


    approver_leave_ref.on_snapshot(on_approver_snapshot)

if __name__ == '__main__':
    # Start listening for changes
    listen_for_changes()
    
    # Start the Flask app
    app.run(debug=True)



# curl -X POST http://localhost:5000/predict_approver \
# -H "Content-Type: application/json" \
# -d '{
#     "amount": 1500,  
#     "category": "Entertainment",
#     "subcategory": "Client Entertainment",
#     "expense_type": "Personal",
#     "department": "Finance",
#     "position": "Executive",
#     "payment_method": "Cash",
#     "receipt_provided": "No"
# }'

# 1500, 'Entertainment', 'Client Entertainment', 'Personal', 'Finance', 'Executive', 'Cash', 'No'
# 50, 'Meals', 'Lunch', 'Business', 'Sales', 'Manager', 'Credit Card', 'Yes'

# curl -X POST http://localhost:5000/predict_approval \
# -H "Content-Type: application/json" \
# -d '{
#   "amount": 15000,
#   "category": "Travel",
#   "subcategory": "Airfare",
#   "expense_type": "Business",
#   "department": "Sales",
#   "position": "Manager",
#   "payment_method": "Credit Card",
#   "receipt_provided": "Yes"
# }'
