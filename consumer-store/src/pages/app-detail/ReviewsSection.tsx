import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Typography, List, Rate, Input, Button, Space, App as AntApp, Empty, Card, Tag } from 'antd';
import { listVisibleReviews, addReview, updateReview } from '../../api/reviews';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../api/client';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ReviewsSection({ appId, averageRating }: { appId: string; averageRating: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = AntApp.useApp();
  const { token, consumerId } = useAuthStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const reviewsQuery = useQuery({
    queryKey: ['app-reviews', appId],
    queryFn: () => listVisibleReviews(appId),
  });

  const reviews = reviewsQuery.data ?? [];
  const myReview = useMemo(() => reviews.find((r) => r.consumerId === consumerId), [reviews, consumerId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? '');
    }
  }, [myReview]);

  const submitMutation = useMutation({
    mutationFn: () =>
      myReview ? updateReview(appId, myReview.id, { rating, comment }) : addReview(appId, { rating, comment }),
    onSuccess: () => {
      message.success(myReview ? 'Đã cập nhật đánh giá' : 'Cảm ơn bạn đã đánh giá!');
      queryClient.invalidateQueries({ queryKey: ['app-reviews', appId] });
      queryClient.invalidateQueries({ queryKey: ['app-stats', appId] });
    },
    onError: (err) => message.error(getErrorMessage(err)),
  });

  function handleSubmit() {
    if (!token) {
      message.info('Vui lòng đăng nhập để đánh giá');
      navigate('/login');
      return;
    }
    if (rating === 0) {
      message.error('Vui lòng chọn số sao');
      return;
    }
    submitMutation.mutate();
  }

  return (
    <div>
      <Title level={4}>Đánh giá & Bình luận <Text type="secondary" style={{ fontSize: 14 }}>({averageRating.toFixed(1)} / 5)</Text></Title>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Text strong>{myReview ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá'}</Text>
        <div style={{ marginTop: 8 }}>
          <Rate value={rating} onChange={setRating} />
        </div>
        <TextArea
          rows={3}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <Button type="primary" style={{ marginTop: 8 }} loading={submitMutation.isPending} onClick={handleSubmit}>
          {myReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </Button>
      </Card>

      {reviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" />
      ) : (
        <List
          loading={reviewsQuery.isLoading}
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <Space>
                  <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                  {review.consumerId === consumerId && <Tag color="purple">Đánh giá của bạn</Tag>}
                </Space>
                <div>{review.comment}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
                {review.developerReply && (
                  <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                    <Text strong style={{ fontSize: 12 }}>Phản hồi từ nhà phát triển:</Text>
                    <div>{review.developerReply}</div>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
