import React, { useState } from 'react';
import { Check, Clock, ExternalLink, ThumbsDown, X } from'lucide-react';

interface TaskProofVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: {
    id: number;
    taskTitle: string;
    platform: string;
    deadline: Date;
    submittedAt: Date;
    imageUrl?: string;
    link: string;
    notes?: string;
    warriorName: string;
    warriorVerified: boolean;
  };
}

const TaskProofVerificationModal: React.FC<TaskProofVerificationModalProps> = ({
  isOpen,
  onClose,
  proof,
}) => {
  const [scale, setScale] = useState(1);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAction = async (_action: 'approve' | 'reject' | 'resubmit') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onClose();
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Adjust the duration as needed (3 seconds in this example)
  };

  const handleApprove = async () => {
    showNotification("Task is Approved");
    onClose();
  };

  const handleReject = async () => {
    showNotification("Task is Rejected");
    onClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async () => {
    showNotification("Task has been deleted");
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50">
          {notification}
        </div>
      )}
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium">Verify Task Proof</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            {proof.imageUrl ? (
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <div
                  className="relative"
                  style={{
                    transform: `scale(${scale})`,
                    transition: 'transform 0.2s ease-out',
                    cursor: 'zoom-in'
                  }}
                  onClick={() => setShowFullImage(true)}
                >
                  <img
                    src={proof.imageUrl}
                    alt="Task Proof"
                    className="w-full rounded-xl"
                  />
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => setScale(s => Math.max(1, s - 0.5))}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setScale(s => Math.min(3, s + 0.5))}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">No image provided</p>
              </div>
            )}

            {proof.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Submitted Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                  {proof.notes}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Task Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Task Name</label>
                  <p className="font-medium">{proof.taskTitle}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Platform</label>
                  <p className="font-medium">{proof.platform}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Submitted By</label>
                  <p className="font-medium flex items-center">
                    {proof.warriorName}
                    {proof.warriorVerified && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Verified
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Deadline</label>
                    <p className="font-medium flex items-center">
                      <Clock size={14} className="mr-1.5" />
                      {proof.deadline.toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Submitted</label>
                    <p className="font-medium">
                      {proof.submittedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500">Proof Link</label>
                  <a
                    href={proof.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center text-blue-500 hover:text-blue-600"
                  >
                    View Original <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {proof.warriorVerified && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                {/* <label htmlFor="autoApprove" className="ml-2 text-sm text-gray-600">
                  Auto-approve similar submissions from this warrior
                </label> */}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} className="mr-1.5" />
                    Approve
                  </>
                )}
              </button>

              <button
                onClick={() => handleAction('resubmit')}
                disabled={isLoading}
                className="btn bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center"
              >
                <Clock size={16} className="mr-1.5" />
                Request Resubmit
              </button>

              <button
                onClick={handleReject}
                disabled={isLoading}
                className="btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <ThumbsDown size={16} className="mr-1.5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullImage && proof.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={proof.imageUrl}
            alt="Task Proof"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskProofVerificationModal;