import { api } from '../api/instances';
import type { Book, BookWithDDay } from '../api/types/book';
import { getStoredSession, padStudentId } from './authService';
import * as cheerio from 'cheerio';

/**
 * HTML 테이블에서 도서 목록 파싱
 * Swift 참조: LibararyInteractorImpl.loadUserRentalBooks
 * CSS 선택자: table[summary='대출정보의 번호, 서지정보, 대출일자, 반납일자, 상태, 연장, 연기횟수 순'] tbody > tr
 */
function parseBooks(html: string): Book[] {
  const $ = cheerio.load(html);
  const rows = $(
    "table[summary='대출정보의 번호, 서지정보, 대출일자, 반납일자, 상태, 연장, 연기횟수 순'] tbody > tr"
  );

  const books: Book[] = [];
  rows.each((_, tr) => {
    const cells = $(tr).find('td');
    if (cells.length < 8) return;

    const getText = (idx: number): string => {
      const cell = cells.eq(idx);
      // 도서명은 <a> 태그 안에 있음 (Swift 참조)
      const link = cell.find('a');
      return link.length > 0 ? link.text().trim() : cell.text().trim();
    };

    books.push({
      num: getText(0),
      name: getText(1),
      rentalDate: getText(2),
      dueDate: getText(3),
      returnedDate: getText(4),
      returnedStatus: getText(5),
      renewable: getText(6),
      renewCount: getText(7),
    });
  });

  return books;
}

/**
 * D-Day 계산
 */
function calculateDDay(dueDate: string): number {
  // dueDate 형식: "2023.11.24" 또는 "2023-11-24"
  const normalized = dueDate.replace(/\./g, '-');
  const due = new Date(normalized);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Book 배열에 D-Day를 계산하여 추가
 */
function addDDay(books: Book[]): BookWithDDay[] {
  return books.map((book) => ({
    ...book,
    dDay: calculateDDay(book.dueDate),
  }));
}

/**
 * 대출 도서 목록 조회
 * Swift 참조: LibraryWebRepositoryImpl.getRentalBooks
 * GET /MyLibrary?q=1&Userid={paddedId}&Userpass={password}
 */
export async function fetchRentalBooks(isHistory: boolean = false): Promise<BookWithDDay[]> {
  const session = await getStoredSession();
  if (!session) {
    throw new Error('No stored session. Please login first.');
  }

  const paddedId = padStudentId(session.credentials.id);

  const { data: html } = await api.get<string>('/MyLibrary', {
    params: {
      q: isHistory ? 1 : undefined,
      Userid: paddedId,
      Userpass: session.credentials.password,
    },
    // HTML 응답이므로 transformResponse 비활성화
    responseType: 'text',
    transformResponse: [(data: string) => data],
  });

  const books = parseBooks(html);
  return addDDay(books);
}
