import codecs, os, qrcode
import qrcode.image.svg

#,image_factory=qrcode.image.svg.SvgPathImage)

def gen(user, color=None, t = None):
	qr = qrcode.QRCode(
    version = 3,
    error_correction = qrcode.constants.ERROR_CORRECT_H,
    box_size = 10,
    border = 6)
	qr.add_data('https://bmeow.ignaciopardo.repl.co/?n=1&p='+user)
	#qr.make(fit=True)
	if not color:
		img = qr.make_image(fill_color="#BD00FF", back_color="black")
	else:
		img = qr.make_image()
	"""
	if not t:
		if color:
			img.save('static/qrs/tmp'+user+'.svg')
			fout = open('static/qrs/'+user+'.svg', 'w')
			fout.write(codecs.open('static/qrs/tmp'+user+'.svg', 'r', 'utf-8').read().replace('#000000', '#BD00FF').replace('xmlns="http://www.w3.org/2000/svg">', 'xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/>'))
			fout.close()
			os.system('rm ' + 'static/qrs/tmp'+user+'.svg')
		else:
			img.save('static/qrs/'+user+'.svg')
	else:
	"""
	img.save('static/qrs/'+user+'.jpg')