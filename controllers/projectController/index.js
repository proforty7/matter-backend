const firebase = require("../../firebase");
const Project = require("../../models/Project");
const Profile = require("../../models/Profile");
const Contributor = require("../../models/ProjectContributor");
const Task = require("../../models/Task");

const addTaskController = async (req, res) => {
  const user = firebase.auth().currentUser;
  const {
    title,
    description,
    type,
    assignedTo,
    priority,
    testCases,
    projectId
  } = req.body;

  try {
    const task = new Task({
      title,
      description,
      type,
      assignedTo,
      assignedBy: user._id,
      priority,
      testCases
    });
    await task.save();

    const project = await Project.findById(projectId);
    project[`${type}s`].push(task._id);
    await project.save();

    return res.status(201).json({
      success: true,
      task
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err
    });
  }
};

const getTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId).populate({
      path: `${type}s`,
      populate: [
        {
          path: "testCases"
        },
        {
          path: "assignedTo"
        },
        {
          path: "assignedBy"
        }
      ]
    });
    const tasks = project[`${type}s`];
    return res.json({
      success: true,
      [`${type}s`]: tasks
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err
    });
  }
};

const createProjectController = async (req, res) => {
  const user = firebase.auth().currentUser;
  const { projectName, description, contributors } = req.body;

  try {
    const contributorIds = [];
    contributors.map(contributor => {
      const newContributor = new Contributor({
        ...contributor
      });
      newContributor.save();
      contributorIds.push(newContributor._id);
    });
    const project = new Project({
      projectName,
      description,
      contributors: contributorIds
    });
    await project.save();

    const profile = await Profile.findOne({ uid: user.uid });
    profile.projects.push(project._id);
    profile.save();

    return res.json({
      success: true,
      project
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false
    });
  }
};

const getProjectsById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findById(id).populate({
      path: "projects",
      populate: {
        path: "contributors",
        populate: "profile"
      }
    });
    console.log(profile);
    return res.json({
      success: true,
      projects: profile.projects
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false
    });
  }
};

const getProjectByName = async (req, res) => {
  const { name } = req.query;
  try {
    const project = await Project.findOne({ projectName: name });
    if (project) {
      return res.json({
        success: true,
        project
      });
    } else {
      return res.json({
        success: false
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err
    });
  }
};

module.exports = {
  createProjectController,
  getProjectsById,
  getProjectByName,
  addTaskController,
  getTasks
};
