import sys
import librosa
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch

audio_path = sys.argv[1]

# Load pre-trained model and processor
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

# Load audio file
audio_input, sample_rate = librosa.load(audio_path, sr=16000)

# Tokenize input
input_values = processor(audio_input, return_tensors="pt", padding="longest").input_values

# Perform inference
with torch.no_grad():
    logits = model(input_values).logits

# Decode predicted tokens to text
predicted_ids = torch.argmax(logits, dim=-1)
transcription = processor.decode(predicted_ids[0])

print(transcription)
