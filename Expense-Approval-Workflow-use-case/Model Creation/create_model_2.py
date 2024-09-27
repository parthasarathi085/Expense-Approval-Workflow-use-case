import pandas as pd

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

import joblib

import os

# Ensure the correct file path
file_path = 'expense_approval_dataset.csv'

# Check if the file exists
if not os.path.exists(file_path):
    raise FileNotFoundError(f"The file {file_path} does not exist.")

# Load the dataset
df_exploded = pd.read_csv(file_path)


# Prepare data for model
features = df_exploded[['Amount', 'Category', 'Subcategory', 'Expense_Type', 'Department', 'Position', 'Payment_Method', 'Receipt_Provided']]
target = df_exploded['Approver']

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

le_approver = LabelEncoder()
target = le_approver.fit_transform(target)

# Split data
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42, stratify=target)

# Train a Random Forest Classifier
clf_approver = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_leaf=4,
    min_samples_split=10,
    bootstrap=True,
    random_state=42
)
clf_approver.fit(X_train, y_train)

# Evaluate the model
y_pred = clf_approver.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

print(f"Model Accuracy: {accuracy * 100:.2f}%")
print(f"Precision: {precision:.2f}")
print(f"Recall: {recall:.2f}")
print(f"F1-score: {f1:.2f}")



# Save the model
joblib.dump(clf_approver, 'feature_2_model.pkl')
