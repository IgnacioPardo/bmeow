from flask import Flask, request, send_from_directory, redirect, Response
from flask_mobility import Mobility
from flask_talisman import Talisman
from gen_qr import gen
from db import *
from statistics import mean
from datetime import datetime

import codecs, os

#Threading
from threading import Thread

#WSGIServer
from gevent.pywsgi import WSGIServer

"""
#Disable Warnings
import warnings
warnings.filterwarnings('ignore')

#Logging
import logging
#Logging configuration set to debug on debug.log file
logging.basicConfig(filename='debug.log',level=logging.DEBUG)
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

#Disable unneeded dependencies logging
werkzeugLog = logging.getLogger('werkzeug')
werkzeugLog.disabled = True
requestsLog = logging.getLogger('urllib3.connectionpool')
requestsLog.disabled = True"""

db = l_db()

UPLOAD_FOLDER = 'static/images'

def run():
	#WSGIServer
	WSGIServer(('', 8081), app).serve_forever()

#Thread
def keep_alive():
	t = Thread(target=run)
	t.start()

def calculate_status(u):
	return int(round(mean([db[u]["rates"][f]*(db[f]["status"]/5) for f in db[u]["rates"].keys()])))

def update_all():
	for u in db.keys():
		db[u]["status"] = calculate_status(u)
	u_db(db)
	return db

#Flask app
app = Flask(__name__)
Mobility(app)
Talisman(app, content_security_policy=None)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def main(params = None):
	#index.html
	date = datetime.today().strftime('%Y-%m-%d')
	return codecs.open('web/index.html', 'r', 'utf-8').read().replace('REPLACE', date)

@app.route('/get_user/<username>')
def get_username(username = None):
	if username:
		return {
			"response" : "success",
			"username" :username,
			"status" : db[username]["status"],
			"rates" : db[username]["rates"],
			"profile_pic" : db[username]["profile_pic"]
		}
	desc = "missing param"
	return {"response" : "error", "description" : desc}

@app.route('/qr/<username>')
@app.route('/qr/<username>/<color>')
def qr(username = None, color = None):
	if username:
		os.system("rm -rf static/qrs")
		os.system("mkdir static/qrs")
		gen(username, color)
		#db[username]["qr"] = 'static/qrs/'+user+'.svg'
		#u_db(db)
		return send_from_directory(os.path.join(app.root_path, 'static', 'qrs'), username + '.jpg')
	return "error"

@app.route('/search_user')
@app.route('/search_user/<query>')
def search_query(query = None):
	if query:
		return {
			"response" : "success", 
			"results": list({str(v):v for v in [{"username": res, "status" : db[res]["status"], "rates" : db[res]["rates"], "profile_pic" : db[res]["profile_pic"]} for res in db.keys() if res.lower().startswith(query.lower())] + [{"username": res, "status" : db[res]["status"], "rates" : db[res]["rates"], "profile_pic" : db[res]["profile_pic"]} for res in db.keys() if res.lower() in query.lower()]}.values())
		}
	return {
		"response" : "success", 
		"results": [{"username": res, "status" : db[res]["status"], "rates" : db[res]["rates"], "profile_pic" : db[res]["profile_pic"]} for res in db.keys()]
	}

@app.route('/sign_in/<username>/<password>')
def sign_in(username = None, password = None):
	if bool(username)*bool(password):
		if username in db.keys():
			if db[username]['pass'] == password:
				if len(db[username]["rates"]):
					db[username]["status"] = int(round(mean(db[username]["rates"].values())))
				u_db(db)
				response = {
					"response" : "success",
					"username" : username,
					"profile_pic" : db[username]["profile_pic"],
					"status" : db[username]["status"],
					"friends" : db[username]["friends"]
				}
				return response
		desc = "incorrect username or password"
		return {"response" : "error", "description" : desc}
	desc = "missing param"
	return {"response" : "error", "description" : desc}


@app.route('/sign_up/<username>/<password>')
def sign_up(username = None, password = None):
	if bool(username)*bool(password):
		if username not in db.keys():
			db[username] = userdb_template
			db[username]["pass"] = password
			u_db(db)
			response = {
				"response" : "success",
				"username" : username,
				"profile_pic" : db[username]["profile_pic"],
				"status" : db[username]["status"],
				"friends" : db[username]["friends"]
			}
			return response
		desc = "incorrect username or password"
		return {"response" : "error", "description" : desc}
	desc = "missing param"
	return {"response" : "error", "description" : desc}

"""
@app.route('/add_friend/<username>/<password>/<friend>')
def add_friend(username = None, password = None, friend = None):
	if bool(username)*bool(password)*bool(friend):
		if db[username]['pass'] == password:
			db[username]["friends"].append(friend)
			u_db(db)
		desc = "incorrect username or password"
		return {"response" : "error", "description" : desc}
	desc = "missing param"
	return {"response" : "error", "description" : desc}
"""

@app.route('/increase_user_rate/<username>/<password>/<friend>')
def increase_user_rate(username = None, password = None, friend = None):
	if bool(username)*bool(password)*bool(friend):
		if db[username]['pass'] == password:
			if (username in db[friend]["rates"].keys()):
				if (db[friend]["rates"][username] < 5):
					db[friend]["rates"][username] += 1
			else:
				rate_user(username, password, friend, db[username]["status"])
				increase_user_rate(username, password, friend)
			status = calculate_status(friend)
			db[friend]["status"] = status
			u_db(db)
			return {
				"response" : "success",
				"status" : status,
				"rates" : db[friend]["rates"],
				"profile_pic" : db[friend]["profile_pic"],
				"username": friend, 
			}
		desc = "incorrect username or password"
		return {"response" : "error", "description" : desc}
	desc = "missing param"
	return {"response" : "error", "description" : desc}

@app.route('/decrease_user_rate/<username>/<password>/<friend>')
def decrease_user_rate(username = None, password = None, friend = None):
	if bool(username)*bool(password)*bool(friend):
		if db[username]['pass'] == password:
			if (username in db[friend]["rates"].keys()):
				if (db[friend]["rates"][username] > 1):
					db[friend]["rates"][username] -= 1
			else:
				rate_user(username, password, friend, db[username]["status"])
				decrease_user_rate(username, password, friend)
			status = calculate_status(friend)
			db[friend]["status"] = status
			u_db(db)
			return {
				"response" : "success",
				"status" : status,
				"rates" : db[friend]["rates"],
				"profile_pic" : db[friend]["profile_pic"],
				"username": friend, 
			}
		desc = "incorrect username or password"
		return {"response" : "error", "description" : desc}
	desc = "missing param"
	return {"response" : "error", "description" : desc}

@app.route('/rate_user/<username>/<password>/<friend>/<rate>')
def rate_user(username = None, password = None, friend = None, rate = None):
	if bool(username)*bool(password)*bool(friend):
		if db[username]['pass'] == password:
			if not rate:
				rate = db[username]["status"]
			db[friend]["rates"][username] = rate
			status = calculate_status(friend)
			db[friend]["status"] = status
			u_db(db)
			return {
				"response" : "success",
				"status" : status,
				"rates" : db[friend]["rates"],
				"profile_pic" : db[friend]["profile_pic"],
			 	"username": friend, 
			}
		print("incorrect username or password")
	print("missing param")
	return {"response" : "error"}



@app.route('/change_image/<username>/<password>', methods=['GET', 'POST'])
def change_image(username = None, password = None):
	date = datetime.today().strftime('%Y-%m-%d-%h-%m-%s')
	if bool(username)*bool(password):
		if username in db.keys():
			if db[username]['pass'] == password:
				if request.method == 'POST':
					if 'file1' not in request.files:
							return 'there is no file1 in form!'
					file1 = request.files['file1']
					path = os.path.join(app.config['UPLOAD_FOLDER'], date+file1.filename)
					file1.save(path)
					os.system("rm " + db[username]["profile_pic"])
					db[username]["profile_pic"] = path
					u_db(db)
					return path
	return {"response" : "error"}

@app.route('/db')
def return_db():
	return db

@app.route('/da')
def delete_all():
	db = clear()
	return 'Done'

@app.route('/update_all_status')
def update_all_status():
	return update_all()

@app.route('/stats')
def stats():
	return html_stats(request.MOBILE)


@app.route('/favicon.ico')
def favicon():
	return send_from_directory(os.path.join(app.root_path, 'static'),'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/service-worker.js')
def service_worker():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'service-worker.js',
        mimetype='application/javascript')

@app.route('/.well-known/assetlinks.json')
def assetlinks():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'assetlinks.json',
        mimetype='application/json')

if __name__ == '__main__':
	#Run server forever
	keep_alive()
