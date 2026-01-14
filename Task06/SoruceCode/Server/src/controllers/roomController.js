exports.checkRoom = (req, res) => {
    const { roomId } = req.params;
    res.json({ valid: true, roomId });
};
