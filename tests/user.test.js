const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const { userOne, userOneId, setUpdatabase } = require('./fixtures/db')

beforeEach(setUpdatabase)

// singup user test
test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name : 'Arin',
        email : 'arinmodi2306@gmail.com',
        password : 'Arin@2306'
    }).expect(200)

    // Assert that the database was changed correctly
    const user = User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertion about the response
    expect(response.body).toMatchObject({
        user : {
            name : 'Arin',
            email : 'arinmodi2306@gmail.com',
        }
    })

    expect(user.password).not.toBe('Arin@2306')
})

// login user test
test('Should login user', async () => {
    const res = await request(app).post('/users/login').send({
        email : userOne.email,
        password : userOne.password
    }).expect(200)

    const user = await User.findById(userOneId);
    expect(res.body.token).toBe(user.tokens[1].token)
})

// non exist user login test
test('Should not login not-exist user', async () => {
    await request(app).post('/users/login').send({
        email : "arinj@gmail.com",
        password : "123456789"
    }).expect(400)
})

// fetch profile test
test('Should get profile for user',async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

// fetch unauth profile test
test('Should not get profile for unauth user',async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(400)
})

// delete user test
test('Should delete user',async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(response.body._id);
    expect(user).toBeNull();
})

// delete unauth user test
test('Should not delete user',async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(400)
})

// upload image
test('Should Upload Avatar',async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/Photo-2.png')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

// update the user
test('Should Update the user name',async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name : 'Mike Zukerberg'
        })
        .expect(200);

        const user = await User.findById(userOneId);
        expect(user.name).toBe("Mike Zukerberg")
})

// invalid update
test('Should not Update the user',async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location : 'Ahmedabad'
        })
        .expect(400)
})

