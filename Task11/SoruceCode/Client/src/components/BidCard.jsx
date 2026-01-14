import { Link } from 'react-router-dom';

const BidCard = ({ bid, isOwner, onAccept }) => {
  return (
    <div className="bid-card">
      <div className="bid-header">
        <Link to={`/profile/${bid.bidder._id}`} className="bidder-info">
          <div className="bidder-avatar">
            {bid.bidder.name?.charAt(0).toUpperCase()}
          </div>
          <div className="bidder-details">
            <span className="bidder-name">{bid.bidder.name}</span>
            <span className="bidder-rating">
              ⭐ {bid.bidder.rating?.average?.toFixed(1) || 'New'} 
              ({bid.bidder.completedTasks || 0} tasks)
            </span>
          </div>
        </Link>
        <div className="bid-amount">
          <span className="amount">${bid.amount}</span>
          <span className="delivery">{bid.deliveryTime.value} {bid.deliveryTime.unit}</span>
        </div>
      </div>

      <div className="bid-skills">
        {bid.bidder.skills?.slice(0, 3).map((skill, i) => (
          <span key={i} className="skill-tag-small">{skill}</span>
        ))}
      </div>

      <p className="bid-proposal">{bid.proposal}</p>

      <div className="bid-footer">
        <span className={`bid-type-badge ${bid.bidType}`}>
          {bid.bidType === 'price' ? '💰 Price-based' : '⏱️ Time-based'}
        </span>
        
        {isOwner && bid.status === 'pending' && (
          <button className="btn btn-success btn-sm" onClick={onAccept}>
            Accept Bid
          </button>
        )}
      </div>
    </div>
  );
};

export default BidCard;
