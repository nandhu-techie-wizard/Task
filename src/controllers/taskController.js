
const User = require('../models/User');  // Import User Model
const Task = require('../models/Task');  // Ensure Task model is also imported


exports.createTask = async (req, res) => {
  try {
    const { title, description, category, priority, assignedTo, dueDate } = req.body;

    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
    }

    // Generate unique task number (TASK-001, TASK-002)
    const taskCount = await Task.countDocuments();
    const taskNumber = `TASK-${String(taskCount + 1).padStart(3, '0')}`;

    const task = new Task({
      taskNumber,
      user: req.user.id, // Task creator
      assignedTo: assignedUser ? assignedUser._id : null,
      title,
      description,
      category,
      priority,
      dueDate, // Store the due date
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const { category, status, priority, search, sort } = req.query;

    let filter = {
      $or: [{ user: req.user.id }, { assignedTo: req.user.id }]
    };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or.push(
        { title: { $regex: search, $options: 'i' } },
        { taskNumber: { $regex: search, $options: 'i' } }
      );
    }

    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .sort(sortOption);

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name _id');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, priority, status, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only allow the task creator to update it
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) return res.status(400).json({ message: 'Assigned user not found' });
    }

    task.title = title || task.title;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure only the creator can delete
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
