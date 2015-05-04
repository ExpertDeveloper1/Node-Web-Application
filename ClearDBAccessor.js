var _und = require('underscore'),
	mysql = require('mysql');
    dbConfig = require('./dbConfig');

var pool = mysql.createPool(dbConfig);

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
	                if (err) {
	                    return callback(err, null);
	                } else {
	                	var useraccountPost = { 
	                		Username : userName, 
	                		Pw : userPassword,
	                		UserNo : dbResult.insertId
	                	}
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
		connection.query('select ISBN, Title, Author, Category from bookinfo', function(queryError, dbResult) {
			if (queryError) {
                return callback(queryError, null);
            } else {
                var result = _und.find(dbResult, function(row) {
                	return row.ISBN == isbn; //isbn == req.headers.isbn
                });
                callback(null, result);
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
        connection.query(queryString, '%' + author + '%', function(queryError, dbResult) {
            if (queryError) return callback(queryError, null);

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
        connection.query(queryString, function(queryError, dbResult) {
            if (queryError) {
                return callback(queryError, null);
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
        connection.query(queryString, function(queryError, dbResult) {
            if (queryError) {
                return callback(queryError, null);
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
        connection.query(queryString, function(queryError, dbResult) {
            if (queryError) {
                return callback(queryError, null);
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