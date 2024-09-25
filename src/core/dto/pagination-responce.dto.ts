import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({ type: () => [Object] })
  data: T[];

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  itemsPerPage: number;

  constructor(
    data: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
  ) {
    this.data = data;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / itemsPerPage);
    this.currentPage = currentPage;
    this.itemsPerPage = itemsPerPage;
  }
}
