/**
 * 대출 도서 모델
 * Swift 참조: DBModel.Book
 */
export interface Book {
  num: string;            // 번호
  name: string;           // 도서명
  rentalDate: string;     // 대출 일자
  dueDate: string;        // 반납 예정일
  returnedDate: string;   // 반납 일자
  returnedStatus: string; // 반납 상태
  renewable: string;      // 연장 가능 여부
  renewCount: string;     // 연장 횟수
}

/**
 * D-Day 계산 결과
 */
export interface BookWithDDay extends Book {
  dDay: number;           // 반납까지 남은 일수 (음수 = 연체)
}
