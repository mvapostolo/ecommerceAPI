const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
    },
    address2: {
        type: String,
    },
    number: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    }
})

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name.'],
        minlength: 3,
        maxlength: 50,
    },
    cpf: {
        type: String,
        require: [true, 'Please provide your CPF.'],
        unique: true,
        // validate: {
        //     validator: validator.isTaxID,
        //     message: 'Please provide valid CPF.'
        // }
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide your email.'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email.'
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide your password.'],
        minlength: 6,
    },
    address: {
        type: addressSchema,
        required: [true, 'Please provide your complete address.']
    },
    phone: {
        type: Number,
        required: [true, 'Please provide your phone.'],
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'user'],
        default: 'user',
    },
})

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)

