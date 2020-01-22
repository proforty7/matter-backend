const Profile = require("../../models/Profile");
const Project = require("../../models/Project");
const _ = require("lodash");

const getPermissions = async (req, res) => {
  const { projectId } = req.query;
  try {
    const profile = await Profile.findById(req.user.profile).populate(
      "organization"
    );

    const { permissionMatrix } = profile.organization;

    const project = await Project.findById(projectId).populate({
      path: "contributors"
    });

    const { contributors } = project;
    const { role } = contributors.find(
      contributor =>
        contributor.profile.toString() === req.user.profile.toString()
    );
    const { permissions } = permissionMatrix.find(item => item.role === role);

    return res.json({
      success: true,
      permissions
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error`
    });
  }
};

const checkPermissions = permission => {
  return async (req, res, next) => {
    const { projectId } = req.body;
    try {
      const profile = await Profile.findById(req.user.profile).populate(
        "organization"
      );

      const { permissionMatrix } = profile.organization;

      const project = await Project.findById(projectId).populate({
        path: "contributors"
      });

      const { contributors } = project;
      const { role } = contributors.find(
        contributor =>
          contributor.profile.toString() === req.user.profile.toString()
      );
      const { permissions } = permissionMatrix.find(item => item.role === role);

      if (!permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `User don't have enough permissions`
        });
      }
      next();
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: `Internal Server Error`
      });
    }
  };
};

module.exports = { checkPermissions, getPermissions };
