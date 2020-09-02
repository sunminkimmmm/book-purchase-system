var express = require('express');
var router = express.Router();
var pool = require('../config/dbConfig');
var multer = require('multer');

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: _storage });

//메인화면
router.get('/main', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM book";
    conn.query(sql, (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//메인화면(평점순으로)
router.get('/main2', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    // SELECT AVG(bookStar) AS `avg` FROM orderdetail WHERE bookCode = ?
    var sql = "SELECT AVG(orderdetail.bookStar),book.bookCode,book.bookName,book.bookPhoto,book.bookPrice FROM orderdetail,book WHERE book.bookCode = orderdetail.bookCode GROUP BY orderdetail.bookCode ORDER BY AVG(orderdetail.bookStar) DESC"
    conn.query(sql, (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//주문목록
router.post('/orderList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM user,ordering,orderdetail,book WHERE user.userId = ordering.userId AND ordering.orderCode = orderdetail.orderCode AND book.bookCode = orderdetail.bookCode AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//책 상세보기
router.get('/book/:bookCode', function (req, res, next) {
  var bookCode = req.params.bookCode;
  var data = {};
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM book WHERE bookCode = ?";
    conn.query(sql, [bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      data = row[0];
      console.log(data);
      res.send(200, {
        result: 1,
        data: data
      })
    })
  })
})

//책 등록
router.post('/bookRegister', upload.single('photo'), function (req, res, next) {
  console.log(req.body);
  var imgurl = 'images/' + req.file.originalname;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    var sql = "INSERT INTO book (bookName, bookAuthor, bookPublisher, bookPrice, bookPhoto) VALUES (?,?,?,?,?);";
    conn.query(sql, [req.body.bookName, req.body.bookAuthor, req.body.bookPublisher, req.body.bookPrice, imgurl], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    });
  })
});

//책 수정
router.post('/bookUpdate/:bookCode', upload.single('photo'), function (req, res, next) {
  var bookCode = req.params.bookCode;
  var postData = req.body;
  var imgurl = 'images/' + req.file.originalname;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE book SET
          
          bookPhoto=?
          WHERE bookCode = ?`;
    conn.query(sql, [imgurl, bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})
router.post('/bookUpdate2/:bookCode', function (req, res, next) {
  var bookCode = req.params.bookCode;
  var postData = req.body;
  var imgurl = 'images/' + req.body.photo;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE book SET
          bookName = ?,
          bookAuthor = ?,
          bookPublisher = ?,
          bookPrice = ?
          WHERE bookCode = ?`;
    conn.query(sql, [postData.bookName, postData.bookAuthor, postData.bookPublisher, postData.bookPrice, bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})
//책 수정
// router.post('/bookUpdate/:bookCode', upload.single('photo'), function (req, res, next) {
//   var bookCode = req.params.bookCode;
//   var postData = req.body;
//   var imgurl = 'images/' + req.file.originalname;
//   pool.getConnection((err, conn) => {
//     if (err) {
//       throw err;
//     }
//     var sql = `UPDATE book SET
//           bookName = ?,
//           bookAuthor = ?,
//           bookPublisher = ?,
//           bookPrice = ?,
//           bookPhoto=?
//           WHERE bookCode = ?`;
//     conn.query(sql, [postData.bookName, postData.bookAuthor, postData.bookPublisher, postData.bookPrice, imgurl, bookCode], (err, row) => {
//       conn.release();
//       if (err) {
//         throw err;
//       }
//       console.log(row);
//       res.send(200, {
//         result: 1
//       })
//     })
//   })
// })

//도서 삭제
router.get('/bookDelete/:bookCode', function (req, res, next) {
  var bookCode = req.params.bookCode;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM book WHERE bookCode = ?";
    conn.query(sql, [bookCode], (err, row) => {
      if (err) {
        throw err;
      }
      var sql = "DELETE FROM book WHERE bookCode = ?";
      conn.query(sql, [bookCode], function (err) {
        if (err) {
          throw err;
        }
        res.send(200, {
          result: 1
        })
      });
    });
  })
});

/*검색 */
router.post('/search', function (req, res, next) {
  //console.log(req.body);
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM book WHERE bookName LIKE '%' ? '%'";
    conn.query(sql, [req.body.searchWord], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        console.log(row)
        res.send(200, {
          result: 1,
          data: row
        })
      }
    })
  })
});

//주문
router.post('/ordering', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    var sql = "SELECT * FROM user WHERE userId=?"
    conn.query(sql, [req.body.userId], function (err, row) {
      if (err) throw err;
      console.log("ㅇㄹㅇ")
      // res.send(200, { result: 1 })
      // var sql = "SELECT * FROM user,ordering,book WHERE ordering.userId = user.userId AND goods.goodsIdx = basket.goodsIdx AND user.userId = ?"
      var sql = "INSERT INTO ordering (orderCode, userId,orderTotalPrice,cardCode,address,point) VALUES (?,?,?,?,?,?);"
      conn.query(sql, [req.body.orderCode, req.body.userId, req.body.orderTotalPrice, req.body.cardCode, req.body.address, req.body.point], function (err, row) {
        conn.release()
        if (err) {
          throw err;
        } else {
          res.send(200, {
            result: 1
          })
        }
      })
    })
  })
})

//주문디테일
router.post('/orderingDetail', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO orderdetail (orderCode,bookCode,amount,orderPrice) VALUES (?, ?, ?, ?);"
    conn.query(sql, [req.body.orderCode, req.body.bookCode, req.body.amount, req.body.orderPrice], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    })
  })
})

//주문 상세보기
router.get('/orderContent/:orderCode', function (req, res, next) {
  var orderCode = req.params.orderCode;
  var data = {};
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    var sql = "SELECT * FROM ordering,orderdetail,book WHERE ordering.orderCode = orderdetail.orderCode AND book.bookCode = orderdetail.bookCode AND ordering.orderCode = ?";
    conn.query(sql, [orderCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(data);
      res.send(200, {
        result: 1,
        data: row
      })
    })
  })
})
//주문 상세보기
router.get('/orderContent2/:orderCode', function (req, res, next) {
  var orderCode = req.params.orderCode;
  var data = {};
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }

    var sql = "SELECT * FROM ordering WHERE orderCode = ?";
    conn.query(sql, [orderCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(data);
      res.send(200, {
        result: 1,
        data: row
      })
    })
  })
})

//주문 취소
router.post('/cancelOrder', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "DELETE FROM orderdetail WHERE orderCode = ? AND bookCode = ?";
    conn.query(sql, [req.body.orderCode, req.body.bookCode], function (err) {
      if (err) {
        throw err;
      }
      res.send(200, {
        result: 1
      })
    });

  })
});

//장바구니
router.post('/basket', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    var sql = "SELECT * FROM user WHERE userId=?"
    conn.query(sql, [req.body.userId], function (err, row) {
      if (err) throw err;
      console.log("ㅇㄹㅇ")
      // res.send(200, { result: 1 })
      // var sql = "SELECT * FROM user,ordering,book WHERE ordering.userId = user.userId AND goods.goodsIdx = basket.goodsIdx AND user.userId = ?"
      var sql = "INSERT INTO basket (basketCode,userId) VALUES (?,?);"
      conn.query(sql, [req.body.basketCode, req.body.userId], function (err, row) {
        conn.release()
        if (err) {
          throw err;
        } else {
          res.send(200, {
            result: 1
          })
        }
      })
    })
  })
})

//장바구니디테일
router.post('/basketDetail', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO basketdetail (basketCode,bookCode,amount) VALUES (?, ?, ?);"
    conn.query(sql, [req.body.basketCode, req.body.bookCode, req.body.amount], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    })
  })
})

//장바구니 수정
router.post('/updateBasket', function (req, res, next) {
  var basketCode = req.params.basketCode;
  var postData = req.body;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE basketdetail SET
          amount = ?
          WHERE basketCode = ? AND bookCode = ?`;
    conn.query(sql, [postData.amount, postData.basketCode, postData.bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})

//장바구니 삭제
router.post('/deleteBasket', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "DELETE FROM basketdetail WHERE basketCode = ? AND bookCode = ?";
    conn.query(sql, [req.body.basketCode, req.body.bookCode], function (err) {
      if (err) {
        throw err;
      }
      res.send(200, {
        result: 1
      })
    });

  })
});

//장바구니 전체삭제
router.get('/allDeleteBasket', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "DELETE FROM basketdetail";
    conn.query(sql, function (err) {
      if (err) {
        throw err;
      }
      var sql = "DELETE FROM basket";
      conn.query(sql, function (err) {
        if (err) {
          throw err;
        }
        res.send(200, {
          result: 1
        })
      });
    });
  })
});

//장바구니목록
router.post('/basketList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM user,basket,basketdetail,book WHERE user.userId = basket.userId AND book.bookCode = basketdetail.bookCode AND basketdetail.basketCode = basket.basketCode AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//회원가입
router.post('/join', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "SELECT * FROM user WHERE userId=?"
    conn.query(sql, [req.body.userId], function (err, row) {
      if (err) throw err;
      if (row.length === 0) {
        var sql = "INSERT INTO user (userId,userPassword,userName,gradeCode) VALUES (?, ?, ?, ?);"
        conn.query(sql, [req.body.userId, req.body.userPassword, req.body.userName, 'bronze'], function (err, row) {
          conn.release()
          if (err) throw err;
          // var sql = "INSERT INTO delivery VALUES (?, ?, ?, ?);"
          // conn.query(sql, [req.body.deliveryAddress1, req.body.deliveryAddress2, req.body.deliveryAddress3, req.body.userId], function (err, row) {
          //   conn.release()
          //   if (err) throw err;
          res.send(200, {
            result: 1
          })

        });
      } else {
        res.send("중복")
      }
    });
  })
})
//환불
router.post('/refund', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO refund (bookCode,orderCode,userId,refundPrice,refundAmount) VALUES (?, ?, ?, ?, ?);"
    conn.query(sql, [req.body.bookCode, req.body.orderCode, req.body.userId, req.body.refundPrice, req.body.refundAmount], function (err, row) {
      conn.release()
      if (err) throw err;
      res.send(200, {
        result: 1
      })
    })
  })
})

//환불리스트
router.post('/refundList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM refund,user,book,ordering WHERE refund.userId = user.userId AND refund.bookCode = book.bookCode AND refund.orderCode = ordering.orderCode AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//포인트등록/수정
router.post('/point', function (req, res, next) {
  var postData = req.body;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE user SET
          point = ?, totalSum = ?
          WHERE userId = ?`;
    conn.query(sql, [postData.point, postData.totalSum, postData.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})
//포인트 불러오기
router.post('/pointList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT point,totalSum FROM user WHERE userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//등급 향상
router.post('/grade', function (req, res, next) {
  var postData = req.body;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE user SET
    gradeCode = ?
          WHERE userId = ?`;
    conn.query(sql, [postData.gradeCode, postData.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})


//내가 산 리스트
router.post('/buyList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT bookCode FROM user,ordering,orderdetail WHERE user.userId = ordering.userId AND ordering.orderCode = orderdetail.orderCode AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});


//별점주기
router.post('/updateBookStar', function (req, res, next) {
  var postData = req.body;
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = `UPDATE orderdetail SET
          bookStar = ?
          WHERE bookCode = ? AND orderCode = ?`;
    conn.query(sql, [postData.bookStar, postData.bookCode, postData.orderCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      console.log(row);
      res.send(200, {
        result: 1
      })
    })
  })
})
//내가산 주문번호
router.post('/getOrderCode', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM user,ordering,orderdetail WHERE user.userId = ordering.userId AND ordering.orderCode = orderdetail.orderCode AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});
//평균 평점구하기
router.post('/getAvgStar', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT AVG(bookStar) AS `avg` FROM orderdetail WHERE bookCode = ?";
    conn.query(sql, [req.body.bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//등급 불러오기
router.post('/gradeList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT gradeCode FROM user WHERE userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//주소등록
router.post('/deliveryAdd', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO deliveryaddress(deliveryAddress1,deliveryAddress2,deliveryAddress3,userId) VALUES (?, ?, ?, ?);"
    conn.query(sql, [req.body.deliveryAddress1, req.body.deliveryAddress2, req.body.deliveryAddress3, req.body.userId], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    })
  })
})
//리뷰등록
router.post('/review', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO review(bookCode,userId,reviewComment) VALUES (?, ?, ?);"
    conn.query(sql, [req.body.bookCode, req.body.userId, req.body.reviewComment], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    })
  })
})
//리뷰목록
router.post('/reviewList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM review,book WHERE review.bookCode = book.bookCode AND book.bookCode = ?";
    conn.query(sql, [req.body.bookCode], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//주소목록
router.post('/deliveryList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM user,deliveryaddress WHERE user.userId = deliveryaddress.userId AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//카드등록
router.post('/cardAdd', function (req, res, next) {
  pool.getConnection(function (err, conn) {
    if (err) throw err;
    var sql = "INSERT INTO card VALUES (?, ?, ?, ?);"
    conn.query(sql, [req.body.cardCode, req.body.cardDate, req.body.cardName, req.body.userId], function (err, row) {
      conn.release()
      if (err) {
        throw err;
      } else {
        res.send(200, {
          result: 1
        })
      }
    })
  })
})

//카드목록
router.post('/cardList', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      throw err;
    }
    var sql = "SELECT * FROM user,card WHERE user.userId = card.userId AND user.userId = ?";
    conn.query(sql, [req.body.userId], (err, row) => {
      conn.release();
      if (err) {
        throw err;
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          check: 0,
          data: row
        })
      }
    })
  })
});

//로그인
router.post('/login', function (req, res, next) {
  var postData = req.body;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    var sql = "SELECT * FROM user WHERE userId = ? AND userPassword = ?";
    conn.query(sql, [postData.userId, postData.userPassword], (err, row) => {
      conn.release()
      if (err) {
        res.send(300, {
          result: 0,
          msg: 'DB Error'
        });
      }
      if (row.length === 0) {
        res.send(300, {
          result: 0,
          msg: "failed"
        });
      } else {
        res.send(200, {
          result: 1,
          data: row[0]
        })
      }
    });
  })
});
module.exports = router;
