# Real-Time Multiplayer Setup

## Өөрчлөлтүүд

### 1. Real-Time Game Service

**Файл:** `/src/services/gameService.ts`

- Supabase broadcast channels ашиглан тоглогчдын хооронд real-time холболт үүсгэнэ
- Дараах мэдээллийг sync хийнэ:
  - **Moves**: Тоглогчийн хөдөлгөөн (цохилт, алхалт гэх мэт)
  - **Position**: Тоглогчийн байрлал (x, y координат)
  - **Life**: Тоглогчийн амь

### 2. Realtime Controller

**Файл:** `/src/components/game/core/controllers/realtimeController.ts`

- Keyboard болон mobile touch control-ийг дэмжинэ
- Room-д байгаа бусад тоглогчидтой real-time-аар холбогдоно
- Player index (0 = host/player1, 1 = joined/player2) дээр үндэслэн character-ийг удирдана

### 3. Mobile Controller

**Файл:** `/src/components/game/core/controllers/mobileController.ts`

- Утсан дээр тоглох боломжтой touch controller
- D-pad (↑↓←→) болон action buttons (A, S, D, F)
- Responsive design - 375px-1024px дэлгэцийн хэмжээнд харагдана

### 4. Game Page Updates

**Файл:** `/src/app/game/page.tsx`

- Room code болон player ID-г URL parameter эсвэл localStorage-оос авна
- Host нь player 0, нэгдсэн хүн player 1 болно
- Real-time controller ашиглан тоглоомыг эхлүүлнэ

### 5. Lobby Page Updates

**Файл:** `/src/app/lobby/[code]/page.tsx`

- Тоглоом эхлэхэд room code-ийг localStorage-д хадгална
- Game page руу room code parameter-тэй шилжинэ

### 6. Mobile Controller Styles

**Файл:** `/src/app/globals.css`

- Touch-friendly controller UI
- Responsive design for different screen sizes
- Visual feedback when buttons are pressed

## Хэрхэн ажилладаг

### Desktop (Компьютер дээр)

1. **Host**: Өрөө үүсгэнэ → QR code харагдана
2. **Player 2**: Утсаараа QR code scan хийнэ эсвэл code оруулна
3. **Хоёулаа**: "Ready" дарна
4. **Host**: "Start Game" дарна
5. **Тоглоом эхэлнэ**:
   - Host нь keyboard-оор тоглоно (WASD + arrow keys)
   - Player 2 нь утсан дээрээ touch controller-оор тоглоно

### Mobile (Утсан дээр)

1. Утсаар QR code scan хийх эсвэл code оруулах
2. "Ready" дарах
3. Тоглоом эхлэхийг хүлээх
4. Touch controller автоматаар гарч ирнэ:
   - **Зүүн тал**: D-pad (хөдөлгөөн)
   - **Баруун тал**: Action buttons (цохилт)

## Controller Mapping

### Keyboard (Player 1 - Host)

- **Movement**: G (←), J (→), Y (↑), H (↓)
- **Actions**: A (High Punch), S (Low Punch), D (Low Kick), F (High Kick)
- **Block**: Shift

### Keyboard (Player 2 - если на компьютере)

- **Movement**: Arrow Keys
- **Actions**: P, [, ], \
- **Block**: Ctrl

### Mobile Touch Controller

- **D-pad**: ↑↓←→ (Хөдөлгөөн)
- **A Button**: High Punch (Улаан)
- **S Button**: Low Punch (Ногоон)
- **D Button**: Low Kick (Цэнхэр)
- **F Button**: High Kick (Шар)

## Technical Details

### Supabase Realtime

- Channel name: `game:{roomId}`
- Broadcast events:
  - `move`: Character movements
  - `position`: X/Y coordinates
  - `life`: Health points

### Player Assignment

```typescript
// Host is always player 0 (left side)
const isHost = room.host_id === playerId;
const playerIndex = isHost ? 0 : 1;

// Fighters array
fighters[0] = "subzero"; // Player 1 (Host)
fighters[1] = "kano"; // Player 2 (Joined)
```

### Mobile Controller Visibility

- Shows only on screens between 375px and 1024px width
- Automatically hides on desktop
- Responsive sizing for different mobile devices

## Troubleshooting

### Controller харагдахгүй байвал

1. Утсны дэлгэцийн хэмжээг шалгах (375px-1024px байх ёстой)
2. Browser console-д алдаа байгаа эсэхийг шалгах
3. Page-ийг refresh хийх

### Real-time sync ажиллахгүй байвал

1. Supabase connection шалгах
2. Room ID болон Player ID зөв эсэхийг шалгах
3. Browser console-д network errors шалгах

### Тоглоом эхлэхгүй байвал

1. Хоёр тоглогч "Ready" дарсан эсэхийг шалгах
2. Room status "playing" болсон эсэхийг шалгах
3. localStorage-д playerId байгаа эсэхийг шалгах

## Next Steps

Дараагийн сайжруулалтууд:

- [ ] Character selection (тоглогч character сонгох)
- [ ] Arena selection (тоглоомын талбай сонгох)
- [ ] Spectator mode (үзэгч горим)
- [ ] Tournament mode (тэмцээний горим)
- [ ] Voice chat integration
- [ ] Replay system
