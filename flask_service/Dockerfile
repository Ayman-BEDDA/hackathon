FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install Flask
RUN pip install gTTS

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
