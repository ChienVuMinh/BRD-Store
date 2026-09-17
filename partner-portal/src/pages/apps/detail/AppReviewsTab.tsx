import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { List, Rate, Typography, Button, Modal, Input, App as AntApp, Empty, Tag } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { listAllReviews, replyToReview } from '../../../api/reviews';
import { getErrorMessage } from '../../../api/client';
import type { AppResponse, ReviewResponse } from '../../../types/models';

const { Text } = Typography;
const { TextArea } = Input;

export default function AppReviewsTab({ app }: { app: AppResponse }) {
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const [replyTarget, setReplyTarget] = useState<ReviewResponse | null>(null);
  const [replyText, setReplyText] = useState('');

  const reviewsQuery = useQuery({
    queryKey: ['app-reviews', app.id],
    queryFn: () => listAllReviews(app.id),
  });

  const replyMutation = useMutation({
    mutationFn: () => replyToReview(app.id, replyTarget!.id, { reply: replyText }),
    onSuccess: () => {
      message.success('Đã gửi phản hồi');
      setReplyTarget(null);
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['app-reviews', app.id] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  const reviews = reviewsQuery.data ?? [];

  return (
    <div>
      {reviews.length === 0 && !reviewsQuery.isLoading ? (
        <Empty description="Chưa có đánh giá nào" />
      ) : (
        <List
          loading={reviewsQuery.isLoading}
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item
              actions={[
                <Button key="reply" size="small" icon={<CommentOutlined />} onClick={() => { setReplyTarget(review); setReplyText(review.developerReply ?? ''); }}>
                  {review.developerReply ? 'Sửa phản hồi' : 'Trả lời'}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                    {review.isHidden && <Tag color="red" style={{ marginLeft: 8 }}>Đã ẩn</Tag>}
                  </span>
                }
                description={
                  <div>
                    <div>{review.comment ?? <Text type="secondary">(Không có bình luận)</Text>}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{new Date(review.createdAt).toLocaleString('vi-VN')}</Text>
                    {review.developerReply && (
                      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                        <Text strong style={{ fontSize: 12 }}>Phản hồi của nhà phát triển:</Text>
                        <div>{review.developerReply}</div>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title="Trả lời đánh giá"
        open={replyTarget !== null}
        onCancel={() => setReplyTarget(null)}
        onOk={() => {
          if (!replyText.trim()) {
            message.error('Vui lòng nhập nội dung phản hồi');
            return;
          }
          replyMutation.mutate();
        }}
        confirmLoading={replyMutation.isPending}
        okText="Gửi"
        cancelText="Hủy"
      >
        {replyTarget && (
          <div style={{ marginBottom: 12 }}>
            <Rate disabled defaultValue={replyTarget.rating} style={{ fontSize: 14 }} />
            <div>{replyTarget.comment}</div>
          </div>
        )}
        <TextArea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Nhập phản hồi..." />
      </Modal>
    </div>
  );
}
