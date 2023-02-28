const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user with id:${req.params.id} was found.`
    );
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save()
const updateUser = async (req, res) => {
  const { email, name, phone } = req.body;
  if (!email || !name || !phone) {
    throw new CustomError.BadRequestError("Please provide all values.");
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both values.");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      "Wrong password has been provided."
    );
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password was updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// update user with findoneandupdate
// const updateUser = async (req, res) => {
//     const { email, name, phone } = req.body
//     if (!email || !name || !phone) {
//         throw new CustomError.BadRequestError('Please provide all values.')
//     }
//     const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name, phone }, { new: true, runValidators: true })

//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({ res, user: tokenUser })
//     res.status(StatusCodes.OK).json({ user: tokenUser })
// }
