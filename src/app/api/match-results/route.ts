import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamOne, teamTwo, matchTime } = body;

    if (!teamOne || !teamTwo || !matchTime) {
      return NextResponse.json(
        { error: 'Missing required fields (teamOne, teamTwo, matchTime)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in the server' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
أنت خبير إحصائيات كرة قدم. وظيفتك هي جلب الإحصائيات الرسمية لمباراة معينة وتحديد الخيار الصحيح لكل سؤال بناءً على النتائج الواقعية.
تفاصيل المباراة:
- الفريق الأول: ${teamOne}
- الفريق الثاني: ${teamTwo}
- تاريخ المباراة: ${matchTime}

الأسئلة والخيارات:
السؤال 1: من هو الفريق المتأهل للدور القادم؟
[0: الفريق الأول، 1: الفريق الثاني]

السؤال 2: من سيسجل أولاً في المباراة؟
[0: الفريق الأول، 1: الفريق الثاني، 2: لا توجد أهداف وتأهل بركلات الترجيح]

السؤال 3: ما هي نتيجة المباراة النهائية (فارق الأهداف)؟
[0: فوز الفريق الأول بفارق هدف، 1: فوز الفريق الأول بفارق هدفين أو أكثر، 2: فوز الفريق الثاني بفارق هدف، 3: فوز الفريق الثاني بفارق هدفين أو أكثر، 4: ركلات ترجيح وتأهل الفريق الأول، 5: ركلات ترجيح وتأهل الفريق الثاني]

السؤال 4: في أي وقت سيتم تسجيل أول هدف؟
[0: الشوط الأول، 1: الشوط الثاني، 2: الأشواط الإضافية، 3: لا توجد أهداف]

السؤال 5: كم عدد البطاقات الملونة (الصفراء والحمراء مجموعين معاً لكل الفريقين)؟
[0: من 0 إلى 2، 1: 3 أو 4، 2: 5 أو 6، 3: 7 أو أكثر]

السؤال 6: الحفاظ على نظافة الشباك؟
[0: نعم الفريق الأول فقط، 1: نعم الفريق الثاني فقط، 2: لا كلا الفريقين استقبل أهدافاً، 3: نعم كلا الفريقين 0-0]

السؤال 7: هل ستشهد المباراة احتساب ركلة جزاء؟
[0: نعم وتم تسجيلها، 1: نعم وتم إهدارها، 2: لا لن تحتسب ركلة جزاء]

السؤال 8: كم عدد الأهداف المسجلة في المباراة؟
[0: لا توجد أهداف، 1: هدف، 2: هدفين، 3: ثلاثة أهداف، 4: أربعة أهداف، 5: خمسة أهداف أو أكثر]
**توجيه حازم جداً بخصوص السؤال 8:** أهداف "ركلات الترجيح الفاصلة (Penalty Shootout)" لا تُجمع ولا تُحسب أبداً ضمن إجمالي أهداف المباراة. قم فقط بجمع الأهداف المسجلة في الوقت الأصلي والإضافي (Regular and Extra time goals) لاختيار الإجابة الصحيحة.

بناءً على أحداث هذه المباراة الواقعية، حدد الرقم الصحيح لكل سؤال (من 0).
أجب فقط بصيغة JSON نظيفة تحتوي على مصفوفة للإجابات بالترتيب:
{
  "answers": [integer, integer, integer, integer, integer, integer, integer, integer]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON directly since we enforced responseMimeType
    const parsedData = JSON.parse(responseText);

    if (!parsedData.answers || !Array.isArray(parsedData.answers) || parsedData.answers.length !== 8) {
      throw new Error("Invalid format returned by AI: Expected array of 8 integers");
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
