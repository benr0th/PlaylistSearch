import urllib3
import requests
import settings
from flask import Flask, render_template, request

app = Flask(__name__)
app.config.from_pyfile('settings.py')
app.secret_key = settings.SECRET_KEY
http = urllib3.PoolManager()


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route('/playlist/<pl>/<name>', methods=['GET', 'POST'])
def playlist(pl, name):
    return render_template('playlist.html')


@app.route('/privacy', methods=['GET'])
def privacy():
    return render_template('privacy.html')


@app.route('/terms', methods=['GET'])
def terms():
    return render_template('terms.html')


if __name__ == '__main__':
    app.run(debug=True)
