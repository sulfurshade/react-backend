exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/react-capstone';
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/react-capstone-tests');
	// 'mongodb://localhost/jwt-auth-demo');
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'testpassword';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
