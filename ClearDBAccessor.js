var _und = require('underscore'),
	mysql = require('mysql');

var dbconfig = {
    connectionLimit: 100, //important
    debug: false,
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'b17bd3ffac20b3',
    password: 'd64c505b20f19d7',
    database: 'heroku_a6679b0da499276'
};

var pool = mysql.createPool(dbconfig);

function _findMatchingUsernameAndPassword(username, password, callback) {
	pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
	    connection.query('select username, pw from useraccount', function(err, dbResult) {
	        connection.release();
	        if (err) {
	            return err;
	        } else {
	            var result = _und.find(dbResult, function(row) {
	                return row.username == username && row.pw == password;
	            });
                callback(null, result);
	        }
	    });
	});
}

function _registerAndValidateUser(post, callback) {
	var username = post.Username,
		email = post.Email,
		userPassword = post.Password,
		userName = post.Username;
	delete post['Password'];

	pool.getConnection(function(err, connection) {
//		checkSQLConnection(err, connection, callback);
        if (err) {
            connection.release();
            return callback(err, null);
        }
	    connection.query('select Username, Email from userinfo', function(err, dbResult) {
	        if (err) {
	            return callback(err, null);
	        } else {
	            var searchUser = _und.find(dbResult, function(row) {
	                return row.username == username || row.Email == email;
	            });
	            console.log('searchUser: ' + JSON.stringify(searchUser));
	            if (searchUser != null) {
	            	console.log('it is really in here');
	            	return callback(new Error('Duplicated User'), null);
	            }

	            connection.query('insert into userinfo set ?', post, function(err, dbResult, fields) {
	            	//{"fieldCount":0,"affectedRows":1,"insertId":182,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}

	                if (err) {
	                    return callback(err, null);
	                } else {
	                	var useraccountPost = { 
	                		Username : userName, 
	                		Pw : userPassword,
	                		UserNo : dbResult.insertId
	                	}
	                	console.log('useraccountPost: ' + JSON.stringify(useraccountPost));
	                	connection.query('insert into useraccount set ?', useraccountPost, function(err, dbResult, fields) {
			            	connection.release();
			            	if (err) {
			            		return callback(err, null);
			            	} else {
			            		return callback(null, useraccountPost);
			            	}
		            	});
	                }
	            });
	        }
	    });
	});
}

function _findMatchingISBN(isbn, callback) {
	pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
		connection.query('select ISBN, Title, Author, Category from bookinfo', function(err, dbResult) {
			if (err) {
                return callback(err, null);
            } else {
                var result = _und.find(dbResult, function(row) {
                	return row.ISBN == isbn; //isbn == req.headers.isbn
                });
                callback(err, result);
            }
		});
	});
}

function _searchAuthor(author, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
        var queryString = 'select ISBN, Author, Title, Category from bookinfo where Author like ?';
        connection.query(queryString, '%' + author + '%', function(err, dbResult) {
            if (err) return callback(err, null);

            //_.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
            var booksArray = [];
            _und.each(dbResult, function(element) {
            	if (element.Author.toLowerCase() == author.toLowerCase()) {
            		var bookInformation = {
	        			isbn : element.ISBN,
	        			author : element.Author,
	        			title : element.Title,
	        			category : element.Category
	        		};
	        		booksArray.push(bookInformation);
            	}
            });

            if (booksArray.length < 1) {
            	return callback(null, 'author not found');
            }
            return callback(null, booksArray);
        });
    });
}

function _filterAllDC(callback) {
	pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
        var queryString = "select ISBN, Author, Title, Category from bookinfo where Category='DC Comics'";
        connection.query(queryString, function(err, dbResult) {
            if (err) {
                return callback(err, null);
            } else {
            	var result = dbResult.map(function(row) {
            		return {
            			isbn : row.ISBN,
            			author : row.Author,
            			title : row.Title,
            			category : row.Category
            		};
            	});

            	return result.length > 0 ? callback(null, result) : callback(null, false);
            }
        });
    });
}

function _filterAllMarvel(callback) {
	pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
        var queryString = "select ISBN, Author, Title, Category from bookinfo where Category='Marvel Comics'";
        connection.query(queryString, function(err, dbResult) {
            if (err) {
                return callback(err, null);
            } else {
            	var result = dbResult.map(function(row) {
            		return {
            			isbn : row.ISBN,
	                    author : row.Author,
	                    title : row.Title,
	                    category : row.Category
            		};
            	});
            	return result.length > 0 ? callback(null, result) : callback(null, false);
            }
        });
    });
}

function _filterAllManga(callback) {
	pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            return callback(err, null);
        }
        var queryString ="select ISBN, Author, Title, Category from bookinfo where Category='Manga'";
        connection.query(queryString, function(err, dbResult) {
            if (err) {
                return callback(err, null);
            } else {
            	var result = dbResult.map(function(row) {
            		return {
            			isbn : row.ISBN,
	                    author : row.Author,
	                    title : row.Title,
	                    category : row.Category
            		};
            	});

            	return result.length > 0 ? callback(null, result) : callback(null, false);
            }
        });
    });
}

module.exports = {
	findMatchingUsernameAndPassword : _findMatchingUsernameAndPassword,
	registerAndValidateUser : _registerAndValidateUser,
	findMatchingISBN : _findMatchingISBN,
	searchAuthor : _searchAuthor,
	filterAllDC : _filterAllDC,
	filterAllMarvel : _filterAllMarvel,
	filterAllManga : _filterAllManga
};