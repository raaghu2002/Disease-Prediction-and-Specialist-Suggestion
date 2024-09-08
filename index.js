import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { spawn } from 'child_process';
import run from './run.js';
import axios from 'axios';
import fs from 'fs';


const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');


// Define your symptoms list (should match columns in Training.csv)
const symptomsList = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain',
    'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
    'spotting_urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss',
    'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 'sunken_eyes',
    'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
    'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever',
    'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes',
    'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose',
    'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 'pain_in_anal_region',
    'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs',
    'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremities', 'excessive_hunger',
    'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
    'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
    'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine', 'continuous_feel_of_urine',
    'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain',
    'altered_sensorium', 'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic_patches',
    'watering_from_eyes', 'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
    'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections',
    'coma', 'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum',
    'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
    'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose',
    'yellow_crust_ooze'
];

const templete = `<section class="results-section">
    <h1>Top 6 Hospitals for (Specialist) in (location)</h1>
<div class="cards-container">
    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

    <div class="hospital-card">
        <h2>( Hospital name )</h2>
        <p>Contact:(contact)</p>
        <p>Address: (Address)</p>
        <p>Website: <a href="(link)">(link)/</a></p>
        <p>Specialist (Specialist): (specialist name)</p>
    </div>

</div>
</section>`


const template1 = `<section class="detailedresult-section">
    <div class="card">
        <h1>Disease Prediction</h1>
        <p>Disease Name: (disease name)</p>
        <p>Accuracy: (accuracy)</p>
        <p>Information about disease: (information about disease)</p>
        <p>Doctor to consult: (doctor to consult)</p>
    </div>
    <a href="/detailed" class="goback-button">Go Back</a>
</section>`


async function getPlaceName(lat, lng) {
    const apiKey = '67a5e0c7a4054f07a4729ca0109668a4'; // Replace with your API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            const placeName = response.data.results[0].formatted;
            return ('Place Name:', placeName);
        } else {
            return ('Place not found');
        }
    } catch (error) {
        return ('Error fetching place:', error.message);
    }
}

async function runPythonScript(userInputs) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('py', ['predict.py', ...userInputs]);
        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(`Python process exited with code ${code}`);
            }
        });

        pythonProcess.on('error', (err) => {
            reject(err);
        });
    });
}


// Load your HTML form (input.ejs)
app.get('/predict', (req, res) => {
    res.render('input', { symptoms: symptomsList });
});

// Handle form submission and call Python script for prediction
app.post('/predict', async (req, res) => {
    // Extract symptoms from form data
    const userInputs = [];
    for (let symptom of symptomsList) {
        userInputs.push(parseInt(req.body[symptom] || 0));  // Ensure input is numeric (0 or 1)
    }



    let result = await runPythonScript(userInputs);
    let prompt = `the patient has ${result} so ,tell me which specialist should he consult`
    let result2 = await run(prompt);


    res.render('result', { predictedDisease: result, predictedDoctor: result2 });

});

app.get('/detailed', async (req, res) => {
    res.render('detailed.ejs');
});

app.post('/detailed', async (req, res) => {
    // Extract the symptoms from the request body
    let symptoms = req.body;
    symptoms = JSON.stringify(symptoms);

    // Construct the string to be passed to the run function
    const inputString = `${symptoms} based on these symptoms predict the disease with accuracy % info about that disease and which doctor should be consulted and add the results for ejs partial in the template ${template1}`;

    // Run the prediction
    let result = await run(inputString);

    // Assuming 'detailedresult.ejs' is your template for displaying detailed results
    const templatePath = './views/detailedresult.ejs'; // Update with your template file path
    fs.writeFileSync(templatePath, result);

    // Render the result
    res.render('completediscreption', { result: result });
});



app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/location', async (req, res) => {

    res.render('location');
});

app.post('/location', async (req, res) => {
    let result = await run(`find the list of top six  hospital for ${req.body.specialist} at ${req.body.location} with each hospital details individually in order of the hospital ranking by medical councils and add the results for ejs partial in the templete ${templete}`);
    const templatePath = './views/hospital.ejs';
    const templateContent = fs.writeFileSync(templatePath, result);
    res.render('location', { location: req.body.location, specialist: req.body.specialist });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
