from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
from g4f.client import Client
import xml

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

def generate_ai_title(url):
    client = Client()
    prompt = f"Act as an SEO expert, create a catchy SEO-optimized title for the following URL: {url}. Only return the title text."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in generate_ai_title: {e}")
        return None

def generate_ai_outline(title):
    client = Client()
    prompt = f"Generate a detailed SEO-optimized outline for the title: {title}. List key sections and subtopics."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in generate_ai_outline: {e}")
        return None

def generate_ai_content(outline):
    client = Client()
    prompt = f"Using the following outline, generate a detailed, SEO-optimized, human-like article: {outline}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in generate_ai_content: {e}")
        return None

@app.route('/api/get-titles', methods=['POST'])
def get_titles():
    data = request.get_json()
    sitemap_url = data.get('sitemapUrl')

    if not sitemap_url:
        return jsonify({'error': 'Sitemap URL is required'}), 400

    try:
        response = requests.get(sitemap_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'xml')
        urls = [url.text for url in soup.find_all('loc')]
        filtered_urls = [url for url in urls if not any(ext in url for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp'])]
        
        titles = [generate_ai_title(url) for url in filtered_urls]
        return jsonify({'titles': titles})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-outlines', methods=['POST'])
def get_outlines():
    data = request.get_json()
    titles = data.get('titles')

    outlines = []
    for title in titles:
        outline = generate_ai_outline(title)
        outlines.append({'title': title, 'outline': outline})
    
    return jsonify({'outlines': outlines})

@app.route('/api/generate-content', methods=['POST'])
def generate_content():
    data = request.get_json()
    outline = data.get('outline')
    
    content = generate_ai_content(outline)
    return jsonify({'content': content})

if __name__ == '__main__':
    app.run(debug=True)
