const { Op } = require('sequelize');
const { Message, User } = require('../models');

const includeUserShape = {
  attributes: ['id', 'username', 'role']
};

const serializeMessage = (message) => ({
  id: message.id,
  senderId: message.sender_id,
  recipientId: message.recipient_id,
  content: message.content,
  readAt: message.read_at,
  createdAt: message.createdAt || message.created_at,
  sender: message.sender ? { id: message.sender.id, username: message.sender.username, role: message.sender.role } : undefined,
  recipient: message.recipient
    ? { id: message.recipient.id, username: message.recipient.username, role: message.recipient.role }
    : undefined
});

const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { recipient_id: userId }]
      },
      include: [
        { model: User, as: 'sender', ...includeUserShape },
        { model: User, as: 'recipient', ...includeUserShape }
      ],
      order: [['created_at', 'DESC']]
    });

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const peer = msg.sender_id === userId ? msg.recipient : msg.sender;
      if (!peer) return;
      if (!isAdmin && peer.role !== 'admin') return;
      if (isAdmin && peer.role !== 'user') return;
      if (!conversationMap.has(peer.id)) {
        conversationMap.set(peer.id, {
          peer: { id: peer.id, username: peer.username, role: peer.role },
          lastMessage: serializeMessage(msg),
          unreadCount: 0
        });
      }
      const convo = conversationMap.get(peer.id);
      if (!msg.read_at && msg.recipient_id === userId) {
        convo.unreadCount += 1;
      }
    });

    return res.json(Array.from(conversationMap.values()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil percakapan' });
  }
};

const getThread = async (req, res) => {
  try {
    const peerId = Number(req.params.peerId);
    if (!peerId || Number.isNaN(peerId)) {
      return res.status(400).json({ message: 'Peer tidak valid' });
    }

    const peer = await User.findByPk(peerId);
    if (!peer) {
      return res.status(404).json({ message: 'Tujuan tidak ditemukan' });
    }

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && peer.role !== 'admin') {
      return res.status(403).json({ message: 'User tidak boleh komunikasi sesama user' });
    }
    if (isAdmin && peer.role !== 'user') {
      return res.status(403).json({ message: 'Admin hanya bisa chat dengan user' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, recipient_id: peerId },
          { sender_id: peerId, recipient_id: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'sender', ...includeUserShape },
        { model: User, as: 'recipient', ...includeUserShape }
      ],
      order: [['created_at', 'ASC']]
    });

    const unreadIds = messages.filter((msg) => !msg.read_at && msg.recipient_id === req.user.id).map((msg) => msg.id);
    if (unreadIds.length > 0) {
      await Message.update(
        { read_at: new Date() },
        {
          where: {
            id: { [Op.in]: unreadIds }
          }
        }
      );
    }

    return res.json({
      peer: { id: peer.id, username: peer.username, role: peer.role },
      messages: messages.map(serializeMessage)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memuat percakapan' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Penerima dan isi pesan wajib diisi' });
    }

    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Penerima tidak ditemukan' });
    }

    if (recipient.id === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat mengirim pesan ke diri sendiri' });
    }

    if (req.user.role === 'user' && recipient.role !== 'admin') {
      return res.status(403).json({ message: 'User hanya boleh membalas admin' });
    }
    if (req.user.role === 'admin' && recipient.role !== 'user') {
      return res.status(403).json({ message: 'Admin hanya boleh menghubungi user' });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      recipient_id: recipient.id,
      content: content.trim()
    });

    const hydrated = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', ...includeUserShape },
        { model: User, as: 'recipient', ...includeUserShape }
      ]
    });

    return res.status(201).json(serializeMessage(hydrated));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengirim pesan' });
  }
};

module.exports = {
  listConversations,
  getThread,
  sendMessage
};
