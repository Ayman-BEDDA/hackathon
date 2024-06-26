from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

UPLOAD_FOLDER = '/usr/src/app/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    if file:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Exécutez le script Python avec le chemin du fichier
        result = subprocess.run(['python', 'transcribe.py', file_path], capture_output=True, text=True)
        
        return jsonify({'transcription': result.stdout.strip()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
