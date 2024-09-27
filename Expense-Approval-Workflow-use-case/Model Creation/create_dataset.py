import pandas as pd
import random
from datetime import datetime, timedelta

# Define approvers and their limits
approvers = [
    {'name': 'Manager', 'limit': 10000},
    {'name': 'Senior Manager', 'limit': 20000},
    {'name': 'Director', 'limit': 30000},
    {'name': 'VP', 'limit': 50000},
    {'name': 'CFO', 'limit': float('inf')}
]

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
approval_statuses = ['Pending', 'Approved']
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
        return 'Pending'
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

def generate_expense_description(payment_method, amount, expense_type, expense_category, expense_subcategory, has_receipt):
    receipt_status = "with receipt" if has_receipt else "without receipt"
    description = f"{amount} paid for {expense_type.lower()} {expense_category.lower()} {expense_subcategory.lower()} with {payment_method} and {receipt_status}"
    print(description)
    return description


# Function to determine the approvers based on the amount
def determine_approvers(amount):
    return [approver['name'] for approver in approvers if amount <= approver['limit']]

# Generate synthetic data
num_records = 2000000
data = []

for i in range(num_records):
    print(i)
    # expense_id = i + 1
    # employee_id = random.randint(1000, 1100)
    # manager_id = random.randint(2000, 2100)
    # name = f"Employee_{employee_id}"
    department = random.choice(departments)
    position = random.choice(positions)
    # date = (datetime.now() - timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d')
    amount = round(random.uniform(10, 100000), 2)
    category = random.choice(expense_categories)
    subcategory = random.choice(expense_subcategories[category])
    expense_type = random.choice(expense_types)
    # project_code = random.choice(project_codes)
    payment_method = random.choice(payment_methods)
    receipt_provided = random.choice(receipt_options)
    # description = f"{subcategory} expense"
    approval_status = determine_approval_status(amount, category, subcategory, payment_method, receipt_provided)
    possible_approvers = determine_approvers(amount)
    approver = possible_approvers[0]

    data.append([department, position, amount, category, subcategory, expense_type, payment_method, receipt_provided, approval_status, approver])

# Create DataFrame
df = pd.DataFrame(data, columns=['Department', 'Position', 'Amount', 'Category', 'Subcategory', 'Expense_Type', 'Payment_Method', 'Receipt_Provided', 'Approval_Status', 'Approver'])

print(df.head())

# Explode possible approvers to separate rows
# df_exploded = df.explode('Possible_Approvers')
# df_exploded = df_exploded.rename(columns={'Possible_Approvers': 'Approver'})

# df_exploded

df.to_csv('expense_approval_dataset.csv', index=False)
