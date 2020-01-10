const signIn = require('../routes/auth/signin');
const request = require('supertest');
const expect = require('chai');

describe ('signin test', () => {
    var token = '';

    // router.get('/', (req, res) => {
    //     var token = jwt.sign({foo: 'bar'}, secret);
    //     res.send({token: token});
    // })

    // before(done => {
    //     request(signIn)
    //         .get('/')
    //         .end((err, res) => {
    //             var result = JSON.parse(res.text);
    //             token = result.token;
    //             done();
    //         });
    // });

    it('should response', done => {
        request(signIn)
            .get('/')
            .set('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHgiOjExMywiaWF0IjoxNTc4NjM4MDU0LCJleHAiOjE1NzkyNDI4NTQsImlzcyI6ImZ1bmRpdG8ifQ.v0D2sK_2qohYjOuOGYLi3nCsrdfi5LhozebbnfILzRs')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }

                // expect(res.text).to.equal('disabled');
                expect(res.text)
                done();
            })
    })
})