import sys
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# Load training data
train_data = pd.read_csv('Training.csv')

# Separate features (symptoms) and target (prognosis)
X_train = train_data.drop(columns=['prognosis'])
y_train = train_data['prognosis']

# Initialize a Decision Tree Classifier
model = DecisionTreeClassifier(random_state=42)

# Train the model
model.fit(X_train, y_train)

# Function to parse user input for symptoms from command line
def parse_user_input():
    if len(sys.argv) != 133:  # Check if total arguments (including script name) are 133 (python predict.py ...)
        print("Incorrect number of symptoms provided. Please provide 132 symptoms separated by commas.")
        sys.exit(1)
    
    symptoms = sys.argv[1:]  # Exclude the script name from arguments
    user_input = [int(symptom.strip()) for symptom in symptoms]
    return user_input

# Function to predict disease based on user input
def predict_disease(user_input):
    # Convert user input into DataFrame with correct column names
    user_input_df = pd.DataFrame([user_input], columns=X_train.columns)
    
    # Predict disease
    predicted_disease = model.predict(user_input_df)
    
    return predicted_disease[0]

# Main program to take user input from command line and predict disease
def main():
    user_input = parse_user_input()
    predicted_disease = predict_disease(user_input)
    print(f'{predicted_disease}')

if __name__ == "__main__":
    main()
