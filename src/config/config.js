process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
process.env.SENDGRID_API_KEY = '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'

let urlDB
if (process.env.NODE_ENV === 'local'){
	urlDB = 'mongodb://localhost:27017/plataforma';
}
else {
	urlDB = 'mongodb+srv://bgiraldox:mysecretpass@nodejsbgiraldocourse-b49pj.mongodb.net/plataforma?retryWrites=true'
}

process.env.URLDB = urlDB