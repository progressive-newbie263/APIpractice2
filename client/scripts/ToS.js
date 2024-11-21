// Nội dung bằng ba ngôn ngữ
const content = {
  "default-US": {
    header: "Terms of Service",
    sections: [
      {
        title: "Changing an Order",
        text: "You have up to <span class='highlight'>2 hours</span> to change your order <span class='highlight'>once</span> after placing that order. After this period, further tries in changing the order may not be guaranteed."
      },
      {
        title: "Updating Personal Information",
        text: "Users can update their personal information once every <span class='highlight'>30 days</span>. For urgent changes, please contact support."
      },
      {
        title: "Refund Policy (Coming Soon...)",
        text: "Refunds are available within <span class='highlight'>7 days</span> of receiving your order. Items must be unused and in their original packaging."
      },
      {
        title: "Customer Support (Coming Soon...)",
        text: "Our support team is available 24/7 to assist you with any issues. Contact us via email at <span class='highlight'>support@example.com</span>."
      }
    ]
  },
  vi: {
    header: "Điều khoản dịch vụ",
    sections: [
      {
        title: "Sửa đơn hàng",
        text: "Bạn có thể sửa đơn hàng <span class='highlight'>một lần<span> trong vòng <span class='highlight'>2 giờ</span> sau khi đặt hàng trong trường hợp bạn không may đặt nhầm một thứ gì đó. Sau thời gian này, việc sửa chữa lại đơn hàng có thể không được đảm bảo."
      },
      {
        title: "Cập nhật thông tin cá nhân",
        text: "Người dùng có thể cập nhật thông tin cá nhân mỗi <span class='highlight'>30 ngày</span>. Nếu cần thay đổi gấp, vui lòng liên hệ bộ phận hỗ trợ."
      },
      {
        title: "Chính sách hoàn tiền (Đang phát triển)",
        text: "Hoàn tiền có sẵn trong vòng <span class='highlight'>7 ngày</span> kể từ khi nhận hàng. Sản phẩm phải chưa qua sử dụng và còn nguyên bao bì."
      },
      {
        title: "Hỗ trợ khách hàng (Đang phát triển)",
        text: "Đội ngũ hỗ trợ của chúng tôi sẵn sàng 24/7 để hỗ trợ bạn. Liên hệ qua email tại <span class='highlight'>support@example.com</span>."
      }
    ]
  },
  en: {
    header: "Terms of Service",
    sections: [
      {
        title: "Fixing an Order",
        text: "You have <span class='highlight'>2 hours</span> after placing your order to make any changes <span class='highlight'>once</span>. Further changes may not be accepted after this time."
      },
      {
        title: "Updating Personal Information",
        text: "Personal information updates are allowed once every <span class='highlight'>30 days</span>. For urgent requests, contact support."
      },
      {
        title: "Refund Policy (Coming Soon...)",
        text: "Refunds are available within <span class='highlight'>7 days</span> of delivery. Items must remain unused and in original packaging."
      },
      {
        title: "Customer Support (Coming Soon...)",
        text: "Our support team is available 24/7. Reach us at <span class='highlight'>support@example.com</span>."
      }
    ]
  }
};

// Lắng nghe sự kiện chọn ngôn ngữ
document.getElementById("language-select").addEventListener("change", function () {
  const selectedLang = this.value;

  // Đổi nhãn label theo ngôn ngữ
  const label = document.getElementById("language-label");
  if (selectedLang === "vi") {
    label.textContent = "Chọn Ngôn Ngữ:";
  } else {
    label.textContent = "Choose Language:";
  }

  // Cập nhật nội dung chính
  document.querySelector(".title").textContent = content[selectedLang].header;

  const sections = document.querySelectorAll("main section");
  sections.forEach((section, index) => {
    section.querySelector("h2").textContent = content[selectedLang].sections[index].title;
    section.querySelector("p").innerHTML = content[selectedLang].sections[index].text;
  });
});
