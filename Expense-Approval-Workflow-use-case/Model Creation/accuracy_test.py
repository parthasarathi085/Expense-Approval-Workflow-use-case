# Generate test cases
import random

import pandas as pd

import joblib
from sklearn.calibration import LabelEncoder

import os

# Ensure the correct file path
file_path = 'expense_approval_dataset.csv'

# Check if the file exists
if not os.path.exists(file_path):
    raise FileNotFoundError(f"The file {file_path} does not exist.")

# Load the dataset
df = pd.read_csv(file_path)


# Prepare data for model
features = df[['Amount', 'Category', 'Subcategory', 'Expense_Type', 'Department', 'Position', 'Payment_Method', 'Receipt_Provided']]
target = df['Approval_Status']

# Encode categorical data
le_category = LabelEncoder()
features['Category'] = le_category.fit_transform(features['Category'])

le_subcategory = LabelEncoder()
features['Subcategory'] = le_subcategory.fit_transform(features['Subcategory'])

le_expense_type = LabelEncoder()
features['Expense_Type'] = le_expense_type.fit_transform(features['Expense_Type'])

le_department = LabelEncoder()
features['Department'] = le_department.fit_transform(features['Department'])

le_position = LabelEncoder()
features['Position'] = le_position.fit_transform(features['Position'])

le_payment_method = LabelEncoder()
features['Payment_Method'] = le_payment_method.fit_transform(features['Payment_Method'])

le_receipt_provided = LabelEncoder()
features['Receipt_Provided'] = le_receipt_provided.fit_transform(features['Receipt_Provided'])

le_status = LabelEncoder()
target = le_status.fit_transform(target)


# Load the saved model
clf_loaded = joblib.load('feature_3_model.pkl')


# Define additional sample data
expense_categories = ['Travel', 'Meals', 'Supplies', 'Entertainment', 'Training', 'Miscellaneous']
expense_subcategories = {
    'Travel': ['Airfare', 'Lodging', 'Transportation'],
    'Meals': ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    'Supplies': ['Office Supplies', 'Hardware', 'Software'],
    'Entertainment': ['Team Outing', 'Client Entertainment', 'Gifts'],
    'Training': ['Courses', 'Conferences', 'Certifications'],
    'Miscellaneous': ['Others', 'Subscriptions', 'Donations']
}
expense_types = ['Business', 'Personal']
approval_statuses = ['Pending', 'Approved', 'Rejected']
departments = ['Sales', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations']
positions = ['Manager', 'Engineer', 'Analyst', 'Executive', 'Coordinator']
project_codes = ['P123', 'P456', 'P789', 'P101', 'P202', 'P303']
payment_methods = ['Credit Card', 'Cash', 'Bank Transfer']
receipt_options = ['Yes', 'No']

# Function to determine approval status based on rules
def determine_approval_status(amount, category, subcategory, payment_method, receipt_provided):
    # General Rules
    if amount < 100:
        return 'Approved'
    if category == 'Entertainment' and amount > 1000:
        return 'Rejected'
    if category == 'Training' and amount < 300:
        return 'Approved'
    if receipt_provided == 'Yes' and amount < 200:
        return 'Approved'

    # Specific Rules based on combinations
    if category == 'Travel':
        if subcategory == 'Airfare':
            if payment_method == 'Credit Card':
                if amount < 1000:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Lodging':
            if payment_method == 'Credit Card':
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 200:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Transportation':
            if payment_method == 'Credit Card':
                if amount < 300:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 100:
                    return 'Approved'
                else:
                    return 'Pending'
    elif category == 'Meals':
        if subcategory == 'Breakfast':
            if payment_method == 'Cash':
                if amount < 20:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 30:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Lunch':
            if payment_method == 'Cash':
                if amount < 50:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 70:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Dinner':
            if payment_method == 'Cash':
                if amount < 70:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 100:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Snacks':
            if payment_method == 'Cash':
                if amount < 10:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 20:
                    return 'Approved'
                else:
                    return 'Pending'
        # Specific Rules based on combinations
    if category == 'Supplies':
        if subcategory == 'Office Supplies':
            if payment_method == 'Credit Card':
                if amount < 200:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 100:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Hardware':
            if payment_method == 'Credit Card':
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 300:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Software':
            if payment_method == 'Credit Card':
                if amount < 1000:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 700:
                    return 'Approved'
                else:
                    return 'Pending'
    elif category == 'Entertainment':
        if subcategory == 'Team Outing':
            if payment_method == 'Company Account':
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 300:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Client Entertainment':
            if payment_method == 'Company Account':
                if amount < 1000:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Gifts':
            if payment_method == 'Credit Card':
                if amount < 200:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 100:
                    return 'Approved'
                else:
                    return 'Pending'
    elif category == 'Training':
        if subcategory == 'Courses':
            if payment_method == 'Credit Card':
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 300:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Conferences':
            if payment_method == 'Credit Card':
                if amount < 1000:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 800:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Certifications':
            if payment_method == 'Credit Card':
                if amount < 1500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 1200:
                    return 'Approved'
                else:
                    return 'Pending'
    elif category == 'Miscellaneous':
        if subcategory == 'Others':
            if payment_method == 'Bank Transfer':
                if amount < 100:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 50:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Subscriptions':
            if payment_method == 'Bank Transfer':
                if amount < 200:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 150:
                    return 'Approved'
                else:
                    return 'Pending'
        elif subcategory == 'Donations':
            if payment_method == 'Credit Card':
                if amount < 500:
                    return 'Approved'
                else:
                    return 'Pending'
            else:
                if amount < 300:
                    return 'Approved'
                else:
                    return 'Pending'

    # Default Pending for other cases
    return 'Pending'


num_test_cases = 10000
test_cases = []

for _ in range(num_test_cases):
    amount = round(random.uniform(10, 5000), 2)
    category = random.choice(expense_categories)
    subcategory = random.choice(expense_subcategories[category])
    expense_type = random.choice(expense_types)
    department = random.choice(departments)
    position = random.choice(positions)
    payment_method = random.choice(payment_methods)
    receipt_provided = random.choice(receipt_options)
    
    # Calculate expected output
    expected_output = determine_approval_status(amount, category, subcategory, payment_method, receipt_provided)
    
    # Add test case
    test_cases.append({
        'Amount': amount,
        'Category': category,
        'Subcategory': subcategory,
        'Expense_Type': expense_type,
        'Department': department,
        'Position': position,
        'Payment_Method': payment_method,
        'Receipt_Provided': receipt_provided,
        'Expected_Output': expected_output
    })


# Predicting on new data
def predict_auto_approval(amount, category, subcategory, expense_type, department, position, payment_method, receipt_provided):
    category_encoded = le_category.transform([category])[0]
    subcategory_encoded = le_subcategory.transform([subcategory])[0]
    expense_type_encoded = le_expense_type.transform([expense_type])[0]
    department_encoded = le_department.transform([department])[0]
    position_encoded = le_position.transform([position])[0]
    payment_method_encoded = le_payment_method.transform([payment_method])[0]
    receipt_provided_encoded = le_receipt_provided.transform([receipt_provided])[0]
    prediction = clf_loaded.predict([[amount, category_encoded, subcategory_encoded, expense_type_encoded, department_encoded, position_encoded, payment_method_encoded, receipt_provided_encoded]])
    return le_status.inverse_transform(prediction)[0]


# Evaluate the model on test cases
correct_predictions = 0

loop_count = 0
for test_case in test_cases:
    loop_count = loop_count + 1
    print(loop_count)
    predicted_output = predict_auto_approval(
        test_case['Amount'],
        test_case['Category'],
        test_case['Subcategory'],
        test_case['Expense_Type'],
        test_case['Department'],
        test_case['Position'],
        test_case['Payment_Method'],
        test_case['Receipt_Provided']
    )
    if predicted_output == test_case['Expected_Output']:
        correct_predictions += 1

accuracy = correct_predictions / num_test_cases * 100
print(f"Model Accuracy on Test Cases: {accuracy:.2f}%")
