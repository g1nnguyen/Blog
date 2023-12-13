const mongoose = require('mongoose');
const {Schema,model} = mongoose;
const autoIncrement = require('mongoose-auto-increment');

// const connection = mongoose.createConnection('mongodb+srv://ntthang1299:CRhevCk6gciO1ibM@cluster0.abecbyu.mongodb.net/?retryWrites=true&w=majority'); // Thay đổi thành URL cơ sở dữ liệu của bạn

// autoIncrement.initialize(connection);
const UserSchema = new Schema({
    id: {type: Number},
    username: {type: String, require: true, min:4, unique: true},
    password: {type: String, require: true},
})
// UserSchema.plugin(autoIncrement.plugin, 'User');
// UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'id' });

const UserModel = model('User',UserSchema);

module.exports = UserModel;