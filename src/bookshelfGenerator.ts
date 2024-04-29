import React from "react";
import MersenneTwister from 'mersenne-twister';
import config from './config'

const SEED = 2024;

type BooksGroup = {
  groupType: string,
  booksHeight: number[],
  booksColors: string[][],
  books: string[];
}

export const useBookshelfGenerator = () => {

  const seed = Number.parseInt(window.location.pathname.split('/')[2]) || SEED;

  const generator = new MersenneTwister(seed);

  const getBookshelves = () => {
    const shelves: BooksGroup[][] = [[]];

    const booksCount = config.books.length;
    let bookIndex = 0;
    let shelfIndex = 0;
    let usedShelfSpace = 0;
    let prevType = 'line';
    let prevPrevType = 'stack';
    while (bookIndex < booksCount) {
      const remainingShelfSpace = config.sizes.shelf.length - usedShelfSpace;
      let groupType = config.groupsTypes[generator.random_int() % 2];
      if (prevType === 'line' && prevPrevType === 'line') {
        groupType = 'stack';
      }
      if (prevType === 'stack' && prevPrevType === 'stack') {
        groupType = 'line';
      }
      const groupSizes = groupType === 'stack' ? config.sizes.stack : config.sizes.line;
      const maxGroupSize = (remainingShelfSpace < groupSizes.countMax && remainingShelfSpace >= groupSizes.countMin) ? remainingShelfSpace : groupSizes.countMax;
      let groupSize = groupSizes.countMin + generator.random_int() % (maxGroupSize - groupSizes.countMin + 1);
      const minBookSize = groupSizes.bookMin;
      const maxBookSize = groupSizes.bookMax;

      let group = [];
      let groupColors = [];
      let paletteIndex = generator.random_int() % (config.palettes.length);
      let colorPalette = config.palettes[paletteIndex]
      for (let i = 0; i < groupSize; i++) {
        let bookSize = minBookSize + generator.random_int() % (maxBookSize - minBookSize + 1);
        if (i > 0) {
          let bookSizeDelta = 0;
          const previousBookSize = group[i - 1];
          const shouldChangeBookSize = generator.random_int() % 2;
          if (shouldChangeBookSize) {
            if (previousBookSize === minBookSize) {
              bookSizeDelta = 1;
            } else if (previousBookSize === maxBookSize) {
              bookSizeDelta = -1;
            } else {
              bookSizeDelta += generator.random_int() % 2 ? 1 : -1;
            }
          }
          bookSize = previousBookSize + bookSizeDelta;
        }
        group.push(bookSize);
        let colorIndex = generator.random_int() % (colorPalette.length);
        if (i > 0 && groupColors[i - 1][0] === colorPalette[colorIndex][0]) {
          if (colorIndex === 0) {
            colorIndex += 1;
          } else if (colorIndex + 1 === colorPalette.length) {
            colorIndex -= 1;
          } else {
            colorIndex += generator.random_int() % 2 ? 1 : -1;
          }
        }
        groupColors.push(colorPalette[colorIndex]);
      }

      if (groupType === 'stack') {
        group = group.sort((a, b) => a - b);
      }

      let groupBooks = config.books.slice(bookIndex, bookIndex + groupSize);

      const groupSizeOnShelf = groupType === 'stack' ? Math.max(...group) : groupSize;
      if (groupSizeOnShelf >= remainingShelfSpace) {
        // TODO - fill remaining space if possible
        if (remainingShelfSpace > 2) {
          groupType = 'line';
          group = group.slice(0, remainingShelfSpace);
          groupColors = groupColors.slice(0, remainingShelfSpace);
          groupBooks = groupBooks.slice(0, remainingShelfSpace);
          groupSize = remainingShelfSpace;

          const booksGroupInfo: BooksGroup = {
            groupType: groupType,
            booksHeight: [...group],
            booksColors: [...groupColors],
            books: groupBooks,
          }
          shelves[shelfIndex].push(booksGroupInfo);
        }
        shelfIndex += 1;
        usedShelfSpace = 0;
        shelves.push([]);
      } else {

        const booksGroupInfo: BooksGroup = {
          groupType: groupType,
          booksHeight: [...group],
          booksColors: [...groupColors],
          books: groupBooks,
        }

        shelves[shelfIndex].push(booksGroupInfo);

        bookIndex += groupSize;

        usedShelfSpace += groupSizeOnShelf + config.sizes.shelf.gap;

        prevPrevType = prevType;
        prevType = groupType;
      }
    }

    return shelves;
  }

  return {
    getBookshelves
  }
}
