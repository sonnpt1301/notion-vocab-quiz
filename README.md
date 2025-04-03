# Notion Vocab Quiz

A CLI tool to create vocabulary quizzes from your Notion database. This tool helps you learn vocabulary by creating interactive quizzes from words stored in your Notion database.

## Features

- Create multiple types of quizzes:
  - Multiple choice
  - Synonym matching
  - Word-definition matching
  - Keyword checking
  - Fill in the blank
- Export quiz results to CSV
- Support for Vietnamese and English definitions
- Interactive CLI interface
- Progress tracking
- Detailed feedback and explanations

## Installation

```bash
npm install -g notion-vocab-quiz
```

You can use any of these commands:

```bash
notion-vocab-quiz  # Full command
nvq             # Short alias
vq                # Shortest alias
```

## Setup

1. Create a Notion integration:

   - Go to https://www.notion.so/my-integrations
   - Login to your Notion account
   - Click "New integration"
   - Give it a name (Integration Name) (e.g., "Vocab Quiz")
   - Select your workspace (Associated workspace)
   - Type "Internal"
   - Click "Save"
   - Show and Copy the API key (Internal Integration Secret)

2. Create Notion Database

   You can duplicate the template from my Notion: [Vocabulary Template](https://sonnpt1301.notion.site/1c491d31f787802b9691c02f7d4eedb7?v=1c991d31f78780d5956f000c269c07a3) or you can create new one by yourself

   Your Notion database should have the following properties:

   - `Word` (title): The vocabulary word
   - `Category` (select): Word category
   - `Definition (VN)` (text): Vietnamese definition
   - `Definition (EN)` (text): English definition
   - `Example` (text): Example sentence
   - `Synonyms` (text): Related words
   - `Note` (text): Additional notes
   - `Created time` (date): When the word was created

3. Share your database with the integration:

   - Open your Notion database
   - Click "..." in the top right
   - Click "Add connections"
   - Select your integration (Integration Name)
   - Click "Confirm"

4. Get your database ID:

   - Open your Notion database in the browser
   - The URL will look like: `https://www.notion.so/sonnpt1301/1c491d31f787802b1231c12f7d4eedb7?v=1c491d31f7878094b5c5000ce9284d43`
   - Copy the database ID (the part between workspace name (sonnpt1301) and ?): 1c491d31f787802b1231c12f7d4eedb7

5. Run the setup command:
   ```bash
   nvq setup
   # or
   vq setup
   ```
   - Enter your Notion API token
   - Enter your database ID
   - The configuration will be saved in `~/.notion-quiz/config.json`

## Usage

1. Start a quiz:

   ```bash
   nvq
   # or
   vq
   ```

2. Choose the time range for words to quiz:

   - All words
   - Today's words
   - Last 7 days
   - Last 30 days
   - Specific date

3. Answer the questions:

   - Multiple choice: Select the correct definition
   - Synonym: Choose the matching synonym
   - Matching: Match words with definitions
   - Keyword check: Enter the definition
   - Fill in the blank: Complete the sentence with the correct word

4. View your results:

   - See your score
   - Review correct and incorrect answers
   - Get detailed explanations

5. Export your vocab to import into Quizlet (optional):
   - Choose to export to CSV
   - Result format:
     Word (word type) - Definition (VN)
     foundation (n) - nguyên tắc cơ bản hoặc nền tảng của một thứ gì đó
     reinforce (v) - làm cho thứ gì đó mạnh hơn hoặc hiệu quả hơn, củng cố, cải thiện
     give a lift back (Idiom) - chở ai đó quay trở lại nơi họ cần đến
     jump the gun (Idiom) - hành động quá sớm hoặc trước thời điểm thích hợp
     screw up (Phrasal verb) - làm rối tung, mắc lỗi hoặc làm hỏng việc
     overstep (v) - vượt quá giới hạn cho phép hoặc chấp nhận được
     hold your horses (Idiom) - dùng để bảo ai đó chậm lại hoặc kiên nhẫn hơn
     headquarters (n) - trụ sở chính hoặc trung tâm điều hành của một tổ chức hoặc công ty

## License

MIT
