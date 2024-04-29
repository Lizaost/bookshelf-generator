import React, {useMemo} from 'react';
import './App.css';
import {useBookshelfGenerator} from "./bookshelfGenerator";

function App() {
  const {
    getBookshelves,
  } = useBookshelfGenerator();

  const bookshelves = useMemo(() => {
    return getBookshelves();
  }, []);

  return (
    <div className="root">
      <div className="shelvesWrapper" id="shelvesWrapper">
        {bookshelves.map((shelf, shelfIndex) =>
          <>
            <div className="shelf" key={shelfIndex}>
              {
                shelf.map((booksGroup, booksGroupIndex) =>
                  <div key={booksGroupIndex} className={booksGroup.groupType === 'stack' ? 'booksStack' : 'booksLine'}>
                    {booksGroup.books.map((value, index, array) => {
                        let bookClass = 'book';
                        if (booksGroup.groupType === 'stack') {
                          bookClass += ' bookHorizontal'
                        } else {
                          bookClass += ' bookVertical'
                        }
                        bookClass += ' b' + booksGroup.booksHeight[index];
                        return <div
                          key={index}
                          className={bookClass}
                          style={{
                            backgroundColor: booksGroup.booksColors[index][0],
                            color: booksGroup.booksColors[index][1],
                          }}>
                          <span>{booksGroup.books[index]}</span>
                        </div>
                      }
                    )}
                  </div>
                )
              }
              <div className="shelfLegs">
                <div className={"leg leftLeg"}></div>
                <div className={"leg rightLeg"}></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
