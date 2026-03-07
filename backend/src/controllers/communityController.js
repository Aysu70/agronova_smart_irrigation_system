const Group = require('../models/Group');
const Message = require('../models/Message');
const Question = require('../models/Question');
const { getIO } = require('../config/socket');

// ============= GROUPS =============

// Get all groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    const group = await Group.create({
      name,
      description,
      isPrivate,
      creator: req.user._id,
      members: [req.user._id]
    });

    // Log group creation
    if (req.logChange) {
      req.logChange({
        action: 'CREATE',
        collectionName: 'Group',
        documentId: group._id,
        newValues: { name, description, isPrivate },
        reason: 'Group created by user'
      }).catch(err => console.error('Audit log error:', err));
    }

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'GROUP_CREATED',
        category: 'COMMUNITY',
        relatedEntityType: 'Group',
        relatedEntityId: group._id,
        description: `Created group: ${name}`,
        data: { isPrivate },
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    await group.populate('creator', 'name email');

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member'
      });
    }

    group.members.push(req.user._id);
    await group.save();

    // Log behavior
    if (req.logBehavior) {
      req.logBehavior({
        action: 'GROUP_JOINED',
        category: 'COMMUNITY',
        relatedEntityType: 'Group',
        relatedEntityId: group._id,
        description: `Joined group: ${group.name}`,
        severity: 'LOW'
      }).catch(err => console.error('Audit log error:', err));
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============= MESSAGES =============

// Get group messages
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email profileImage')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, image } = req.body;

    const message = await Message.create({
      group: groupId,
      sender: req.user._id,
      content,
      image
    });

    await message.populate('sender', 'name email profileImage');

    // Emit real-time message
    const io = getIO();
    io.to(`group_${groupId}`).emit('new_message', message);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============= Q&A =============

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('user', 'name email region')
      .populate('answers.user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create question
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const question = await Question.create({
      user: req.user._id,
      title,
      content,
      tags
    });

    await question.populate('user', 'name email region');

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add answer to question
exports.addAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.answers.push({
      user: req.user._id,
      content
    });

    await question.save();
    await question.populate('user', 'name email region');
    await question.populate('answers.user', 'name email');

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark answer as best
exports.markBestAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Only question owner can mark best answer
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Remove previous best answer
    question.answers.forEach(answer => {
      answer.isBestAnswer = false;
    });

    // Mark new best answer
    const answer = question.answers.id(answerId);
    if (answer) {
      answer.isBestAnswer = true;
    }

    await question.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
