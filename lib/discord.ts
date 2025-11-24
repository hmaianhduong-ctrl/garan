import axios from 'axios';

interface DiscordPayload {
  title: string;
  description: string;
  slug: string;
  authorName?: string;
}

export const sendDiscordNotification = async ({ title, description, slug, authorName }: DiscordPayload) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("❌ Chưa cấu hình DISCORD_WEBHOOK_URL trong file .env");
    return;
  }

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`;

  try {
    await axios.post(webhookUrl, {
      username: "Hệ thống Gà Rán F&B", 
      avatar_url: "https://i.ibb.co/1YrzpZNJ/1.png",
      embeds: [
        {
          title: `BÀI VIẾT MỚI: ${title}`,
          url: postUrl,
          description: description || "Một bài viết mới vừa được xuất bản.",
          color: 12204033, //  #BA3801 (Màu chủ đạo)
          fields: [
            {
              name: "Người đăng",
              value: authorName || "Admin",
              inline: true,
            },
            {
              name: "Thời gian",
              value: new Date().toLocaleString('vi-VN'),
              inline: true,
            }
          ],
          footer: {
            text: "F&B Management System Notification"
          }
        }
      ]
    });

    console.log("✅ Đã gửi thông báo Discord thành công!");
  } catch (error) {
    console.error("❌ Lỗi gửi Discord:", error);
  }
};