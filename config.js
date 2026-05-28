module.exports = {
  // التوكن محمي ويقرأ من متغيرات البيئة في Railway
  token: process.env.DISCORD_TOKEN || process.env.TOKEN,
  
  // تم تعطيل نظام البريفكس القديم، ويعتمد البوت الآن على السلاش والاختصارات الحديثة
  
  // ضع الأيدي الخاص بك هنا مباشرة بين علامتي التنصيص
  owner: process.env.OWNER_ID || "656783724662226963"
};
