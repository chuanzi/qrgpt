// @ts-ignore
import promptmaker from 'promptmaker';

// 为QR Code生成场景描述提示
export function generateQrPrompts(count: number = 4): string[] {
  const prompts: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 为QR Code页面生成适合的场景描述
    const prompt = promptmaker({
      subject: 'landscape', // 以风景为主题
      flavors: ['highly detailed', 'beautiful', 'photorealistic']
    });
    prompts.push(prompt);
  }
  
  return prompts;
}

// 为姜饼人生成相关场景提示
export function generateGingerbreadPrompts(count: number = 4): string[] {
  const prompts: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 自定义姜饼人相关的提示
    const subjects = [
      'a gingerbread man',
      'a gingerbread house',
      'a gingerbread family',
      'a gingerbread village',
      'a gingerbread castle',
      'a gingerbread baker',
      'a gingerbread knight'
    ];
    
    const settings = [
      'in the snow',
      'by a fireplace',
      'in a winter forest',
      'at a christmas market',
      'in a bakery',
      'with candy decorations',
      'with frosting details'
    ];
    
    // 随机选择主题和环境
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomSetting = settings[Math.floor(Math.random() * settings.length)];
    
    prompts.push(`${randomSubject} ${randomSetting}`);
  }
  
  return prompts;
}

// 为赛博朋克字体生成相关场景提示
export function generateCyberpunkPrompts(count: number = 4): string[] {
  const prompts: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 赛博朋克字体相关的单词
    const words = [
      '"Cyber"',
      '"Neon"',
      '"Future"',
      '"Digital"',
      '"Tech"',
      '"Synth"',
      '"Retro"',
      '"Hack"',
      '"Tokyo"',
      '"Ghost"'
    ];
    
    // 赛博朋克场景
    const backgrounds = [
      'on a rainy street',
      'with glitch effects',
      'on a circuit board',
      'against a cityscape',
      'in a neon alley',
      'with holographic projections',
      'in a dystopian metropolis',
      'with synthwave aesthetics',
      'in a digital void',
      'with cybernetic elements'
    ];
    
    // 随机选择词和背景
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    
    prompts.push(`${randomWord} in a Cyberpunk typeface ${randomBackground}`);
  }
  
  return prompts;
} 