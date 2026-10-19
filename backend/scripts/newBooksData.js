// Helper to build OpenLibrary cover URL from ISBN
const coverUrl = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// Helper to build a complete book object
const book = (title, author, genre, isbn, publisher, publicationYear, rating, totalCopies, availableCopies, issuedCopies, description) => ({
  title,
  author,
  genre,
  isbn: String(isbn).replace(/[\s-]/g, ''), // stored as digits only
  publisher,
  publicationYear,
  rating,
  totalCopies,
  availableCopies,
  issuedCopies,
  description,
  coverImage: coverUrl(isbn),
  imageUrl: coverUrl(isbn),
  isActive: true,
});

// 150+ new books across all existing categories
const NEW_BOOKS = [
  // ===== Programming (10) =====
  book('The C Programming Language', 'Brian W. Kernighan', 'Programming', '9780131103627', 'Prentice Hall', 1988, 4.7, 6, 4, 2, 'The classic guide to the C programming language, written by its creators.'),
  book('Effective Java', 'Joshua Bloch', 'Programming', '9780134685991', 'Addison-Wesley', 2018, 4.8, 7, 5, 2, 'A comprehensive guide to best practices in Java programming.'),
  book("You Don't Know JS: Scope & Closures", 'Kyle Simpson', 'Programming', '9781449335588', "O'Reilly Media", 2014, 4.6, 5, 4, 1, 'A deep dive into JavaScript scope and closures.'),
  book('Eloquent JavaScript', 'Marijn Haverbeke', 'Programming', '9781593279509', 'No Starch Press', 2018, 4.5, 8, 6, 2, 'A modern introduction to programming with JavaScript.'),
  book('Head First Design Patterns', 'Eric Freeman', 'Programming', '9780596007126', "O'Reilly Media", 2004, 4.4, 6, 4, 2, 'A brain-friendly guide to design patterns.'),
  book('The Clean Coder', 'Robert C. Martin', 'Programming', '9780137081073', 'Prentice Hall', 2011, 4.3, 5, 3, 2, 'A code of conduct for professional programmers.'),
  book('Programming Pearls', 'Jon Bentley', 'Programming', '9780201657883', 'Addison-Wesley', 1999, 4.5, 4, 3, 1, 'A collection of essays on programming techniques and problem-solving.'),
  book('The Mythical Man-Month', 'Frederick P. Brooks Jr.', 'Programming', '9780201835953', 'Addison-Wesley', 1995, 4.2, 5, 4, 1, 'Essays on software engineering and project management.'),
  book('Structure and Interpretation of Computer Programs', 'Harold Abelson', 'Programming', '9780262510875', 'MIT Press', 1996, 4.6, 4, 3, 1, 'The classic textbook on computer programming and abstraction.'),
  book('The Go Programming Language', 'Alan A. A. Donovan', 'Programming', '9780134190440', 'Addison-Wesley', 2015, 4.7, 6, 4, 2, 'The authoritative guide to the Go programming language.'),

  // ===== Computer Science (10) =====
  book('Algorithms', 'Robert Sedgewick', 'Computer Science', '9780321573513', 'Addison-Wesley', 2011, 4.5, 6, 4, 2, 'A comprehensive introduction to algorithms and data structures.'),
  book('The Algorithm Design Manual', 'Steven S. Skiena', 'Computer Science', '9781848000698', 'Springer', 2008, 4.4, 5, 3, 2, 'A practical guide to algorithm design and analysis.'),
  book('Cracking the Coding Interview', 'Gayle Laakmann McDowell', 'Computer Science', '9780984782857', 'CareerCup', 2015, 4.6, 8, 6, 2, '189 programming questions and solutions for technical interviews.'),
  book("Computer Systems: A Programmer's Perspective", 'Randal E. Bryant', 'Computer Science', '9780134092669', 'Pearson', 2015, 4.7, 5, 4, 1, 'A programmer-centric view of computer systems.'),
  book('The Elements of Computing Systems', 'Noam Nisan', 'Computer Science', '9780262640688', 'MIT Press', 2005, 4.3, 4, 3, 1, 'Building a modern computer from first principles.'),
  book('Distributed Systems', 'Maarten van Steen', 'Computer Science', '9781543057386', 'CreateSpace', 2017, 4.2, 5, 4, 1, 'Principles and paradigms of distributed systems.'),
  book('Compilers: Principles, Techniques, and Tools', 'Alfred V. Aho', 'Computer Science', '9780321547989', 'Addison-Wesley', 2006, 4.4, 4, 3, 1, 'The classic dragon book on compiler design.'),
  book('Computer Architecture: A Quantitative Approach', 'John L. Hennessy', 'Computer Science', '9780128119051', 'Morgan Kaufmann', 2017, 4.5, 4, 3, 1, 'A quantitative approach to computer architecture.'),
  book('The Pragmatic Programmer: 20th Anniversary Edition', 'David Thomas', 'Computer Science', '9780135957059', 'Addison-Wesley', 2019, 4.8, 7, 5, 2, 'Your journey to mastery in software engineering, updated for the modern era.'),
  book('Designing Data-Intensive Applications', 'Martin Kleppmann', 'Computer Science', '9781449373320', "O'Reilly Media", 2017, 4.8, 6, 4, 2, 'The big ideas behind reliable, scalable, and maintainable systems.'),

  // ===== Database (8) =====
  book('MongoDB: The Definitive Guide', 'Kristina Chodorow', 'Database', '9781449344689', "O'Reilly Media", 2013, 4.3, 5, 4, 1, 'Powerful and scalable data storage with MongoDB.'),
  book('SQL Performance Explained', 'Markus Winand', 'Database', '9783950307825', 'Independently Published', 2012, 4.5, 4, 3, 1, 'Everything developers need to know about SQL performance.'),
  book('Database Design for Mere Mortals', 'Michael J. Hernandez', 'Database', '9780321884497', 'Addison-Wesley', 2013, 4.2, 5, 4, 1, 'A hands-on guide to relational database design.'),
  book('Seven Databases in Seven Weeks', 'Eric Redmond', 'Database', '9781937786120', 'Pragmatic Bookshelf', 2012, 4.1, 4, 3, 1, 'A guide to modern databases and the NoSQL movement.'),
  book('PostgreSQL: Up and Running', 'Regina O. Obe', 'Database', '9781449366339', "O'Reilly Media", 2017, 4.3, 5, 4, 1, 'A practical guide to the advanced open source database.'),
  book('Redis in Action', 'Josiah L. Carlson', 'Database', '9781617290855', 'Manning Publications', 2013, 4.2, 4, 3, 1, 'A practical guide to Redis data structures and use cases.'),
  book('The Data Warehouse Toolkit', 'Ralph Kimball', 'Database', '9781118530801', 'Wiley', 2013, 4.4, 4, 3, 1, 'The definitive guide to dimensional modeling.'),
  book('High Performance MySQL', 'Baron Schwartz', 'Database', '9781449332471', "O'Reilly Media", 2012, 4.5, 5, 4, 1, 'Optimization, backups, and replication for MySQL.'),

  // ===== Networking (8) =====
  book('Computer Networking: A Top-Down Approach', 'James F. Kurose', 'Networking', '9780133594140', 'Pearson', 2016, 4.5, 6, 4, 2, 'A top-down approach to computer networking.'),
  book('TCP/IP Illustrated, Volume 1', 'W. Richard Stevens', 'Networking', '9780321336316', 'Addison-Wesley', 2011, 4.7, 5, 4, 1, 'The protocols of the TCP/IP suite explained in detail.'),
  book('Network Warrior', 'Gary A. Donahue', 'Networking', '9781449387860', "O'Reilly Media", 2011, 4.3, 4, 3, 1, 'Everything you need to know about network engineering.'),
  book('CCNA Routing and Switching', 'Wendell Odom', 'Networking', '9781587205798', 'Cisco Press', 2013, 4.4, 5, 4, 1, 'The official study guide for CCNA certification.'),
  book('DNS and BIND', 'Paul Albitz', 'Networking', '9780596100575', "O'Reilly Media", 2006, 4.2, 4, 3, 1, 'The definitive guide to DNS and BIND.'),
  book('The TCP/IP Guide', 'Charles M. Kozierok', 'Networking', '9781593270476', 'No Starch Press', 2005, 4.3, 4, 3, 1, 'A comprehensive, illustrated internet protocols reference.'),
  book('Network Security Essentials', 'William Stallings', 'Networking', '9780134527338', 'Pearson', 2016, 4.1, 5, 4, 1, 'Applications and standards for network security.'),
  book('Practical Packet Analysis', 'Chris Sanders', 'Networking', '9781593278021', 'No Starch Press', 2017, 4.4, 4, 3, 1, 'Using Wireshark to solve real-world network problems.'),

  // ===== Cyber Security (8) =====
  book("The Web Application Hacker's Handbook", 'Dafydd Stuttard', 'Cyber Security', '9781118026472', 'Wiley', 2011, 4.5, 5, 4, 1, 'Finding and exploiting security flaws in web applications.'),
  book('Hacking: The Art of Exploitation', 'Jon Erickson', 'Cyber Security', '9781593271442', 'No Starch Press', 2008, 4.4, 4, 3, 1, 'A comprehensive guide to hacking and exploitation.'),
  book('The Hacker Playbook 3', 'Peter Kim', 'Cyber Security', '9781980901754', 'Independently Published', 2018, 4.3, 5, 4, 1, 'Practical guide to penetration testing and red teaming.'),
  book("Metasploit: The Penetration Tester's Guide", 'David Kennedy', 'Cyber Security', '9781593272883', 'No Starch Press', 2011, 4.2, 4, 3, 1, 'The definitive guide to the Metasploit framework.'),
  book('Practical Malware Analysis', 'Michael Sikorski', 'Cyber Security', '9781593272906', 'No Starch Press', 2012, 4.6, 4, 3, 1, 'The hands-on guide to dissecting malicious software.'),
  book('The Tangled Web', 'Michal Zalewski', 'Cyber Security', '9781593273880', 'No Starch Press', 2011, 4.4, 4, 3, 1, 'A guide to securing modern web applications.'),
  book('Social Engineering: The Art of Human Hacking', 'Christopher Hadnagy', 'Cyber Security', '9780470639535', 'Wiley', 2010, 4.1, 4, 3, 1, 'Understanding and defending against social engineering attacks.'),
  book('Ghost in the Wires', 'Kevin Mitnick', 'Cyber Security', '9780316037723', 'Little, Brown and Company', 2011, 4.3, 5, 4, 1, "My adventures as the world's most wanted hacker."),

  // ===== AI & Machine Learning (8) =====
  book('Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', 'Aurélien Géron', 'AI & Machine Learning', '9781492032649', "O'Reilly Media", 2019, 4.7, 7, 5, 2, 'Concepts, tools, and techniques to build intelligent systems.'),
  book('Pattern Recognition and Machine Learning', 'Christopher M. Bishop', 'AI & Machine Learning', '9780387310732', 'Springer', 2006, 4.5, 4, 3, 1, 'A comprehensive introduction to pattern recognition and machine learning.'),
  book('Machine Learning Yearning', 'Andrew Ng', 'AI & Machine Learning', '9781999579500', 'Self-Published', 2018, 4.6, 6, 4, 2, 'Technical strategy for AI engineers.'),
  book('The Hundred-Page Machine Learning Book', 'Andriy Burkov', 'AI & Machine Learning', '9781999579517', 'Andriy Burkov', 2019, 4.4, 5, 4, 1, 'A concise introduction to machine learning.'),
  book('Deep Learning with Python', 'François Chollet', 'AI & Machine Learning', '9781617294433', 'Manning Publications', 2017, 4.6, 6, 4, 2, 'A practical guide to deep learning with Keras.'),
  book('Reinforcement Learning: An Introduction', 'Richard S. Sutton', 'AI & Machine Learning', '9780262039246', 'MIT Press', 2018, 4.5, 4, 3, 1, 'The definitive textbook on reinforcement learning.'),
  book('Python Machine Learning', 'Sebastian Raschka', 'AI & Machine Learning', '9781789955750', 'Packt Publishing', 2019, 4.4, 5, 4, 1, 'Machine learning and deep learning with Python, scikit-learn, and TensorFlow.'),
  book('The Master Algorithm', 'Pedro Domingos', 'AI & Machine Learning', '9780465065707', 'Basic Books', 2015, 4.2, 5, 4, 1, 'How the quest for the ultimate learning machine will remake our world.'),

  // ===== Technology (8) =====
  book('The Phoenix Project', 'Gene Kim', 'Technology', '9780988262591', 'IT Revolution Press', 2013, 4.5, 6, 4, 2, 'A novel about IT, DevOps, and helping your business win.'),
  book('Site Reliability Engineering', 'Niall Richard Murphy', 'Technology', '9781491929124', "O'Reilly Media", 2016, 4.5, 5, 4, 1, 'How Google runs production systems.'),
  book('The DevOps Handbook', 'Gene Kim', 'Technology', '9781942788003', 'IT Revolution Press', 2016, 4.4, 5, 4, 1, 'How to create world-class agility, reliability, and security.'),
  book('Clean Agile', 'Robert C. Martin', 'Technology', '9780135781869', 'Prentice Hall', 2019, 4.3, 4, 3, 1, 'Back to basics in agile software development.'),
  book('The Lean Mindset', 'Mary Poppendieck', 'Technology', '9780321896896', 'Addison-Wesley', 2013, 4.2, 4, 3, 1, 'Ask the right questions to build the right things.'),
  book('Continuous Delivery', 'Jez Humble', 'Technology', '9780321601919', 'Addison-Wesley', 2010, 4.4, 4, 3, 1, 'Reliable software releases through build, test, and deployment automation.'),
  book('The Goal', 'Eliyahu M. Goldratt', 'Technology', '9780884271956', 'North River Press', 2004, 4.3, 6, 4, 2, 'A process of ongoing improvement in manufacturing.'),
  book('Accelerate', 'Nicole Forsgren', 'Technology', '9781942788331', 'IT Revolution Press', 2018, 4.5, 5, 4, 1, 'The science of lean software and DevOps.'),

  // ===== Startup (8) =====
  book("The Startup Owner's Manual", 'Steve Blank', 'Startup', '9780984999309', 'K & S Ranch', 2012, 4.3, 5, 4, 1, 'The step-by-step guide for building a great company.'),
  book('The Hard Thing About Hard Things', 'Ben Horowitz', 'Startup', '9780062273208', 'Harper Business', 2014, 4.5, 6, 4, 2, 'Building a business when there are no easy answers.'),
  book('The Mom Test', 'Rob Fitzpatrick', 'Startup', '9781492180746', 'CreateSpace', 2013, 4.6, 5, 4, 1, 'How to talk to customers and learn if your business is a good idea.'),
  book('Hooked: How to Build Habit-Forming Products', 'Nir Eyal', 'Startup', '9781591847786', 'Portfolio', 2014, 4.3, 6, 4, 2, 'How to build habit-forming products.'),
  book('The Lean Product Playbook', 'Dan Olsen', 'Startup', '9781118960875', 'Wiley', 2015, 4.2, 4, 3, 1, 'How to innovate with minimum viable products and rapid customer feedback.'),
  book('Venture Deals', 'Brad Feld', 'Startup', '9781119259756', 'Wiley', 2016, 4.4, 4, 3, 1, 'Be smarter than your lawyer and venture capitalist.'),
  book('The $100 Startup', 'Chris Guillebeau', 'Startup', '9780307951526', 'Crown Business', 2012, 4.1, 5, 4, 1, 'Reinvent the way you make a living, do what you love, and create a new future.'),
  book('Sprint', 'Jake Knapp', 'Startup', '9781501121746', 'Simon & Schuster', 2016, 4.3, 5, 4, 1, 'How to solve big problems and test new ideas in just five days.'),

  // ===== Motivation (8) =====
  book('The Power of Positive Thinking', 'Norman Vincent Peale', 'Motivation', '9780743234801', 'Touchstone', 2003, 4.2, 6, 4, 2, 'A practical guide to mastering the problems of everyday living.'),
  book('Awaken the Giant Within', 'Tony Robbins', 'Motivation', '9780671791544', 'Free Press', 1992, 4.3, 5, 4, 1, 'How to take immediate control of your mental, emotional, physical, and financial destiny.'),
  book('The 5 AM Club', 'Robin Sharma', 'Motivation', '9781443456623', 'HarperCollins', 2018, 4.1, 6, 4, 2, 'Own your morning, elevate your life.'),
  book("Can't Hurt Me", 'David Goggins', 'Motivation', '9781544512273', 'Lioncrest Publishing', 2018, 4.6, 7, 5, 2, 'Master your mind and defy the odds.'),
  book('The Obstacle Is the Way', 'Ryan Holiday', 'Motivation', '9781591846352', 'Portfolio', 2014, 4.4, 5, 4, 1, 'The timeless art of turning trials into triumph.'),
  book('Grit: The Power of Passion and Perseverance', 'Angela Duckworth', 'Motivation', '9781501111105', 'Scribner', 2016, 4.3, 6, 4, 2, 'The power of passion and perseverance.'),
  book('The War of Art', 'Steven Pressfield', 'Motivation', '9781936891023', 'Black Irish Entertainment', 2002, 4.4, 4, 3, 1, 'Break through the blocks and win your inner creative battles.'),
  book('Deep Work', 'Cal Newport', 'Motivation', '9781455586691', 'Grand Central Publishing', 2016, 4.4, 6, 4, 2, 'Rules for focused success in a distracted world.'),

  // ===== Fiction (15) =====
  book('The Lord of the Rings', 'J.R.R. Tolkien', 'Fiction', '9780544003415', 'Mariner Books', 2004, 4.8, 8, 6, 2, 'The epic fantasy trilogy set in Middle-earth.'),
  book('The Hunger Games', 'Suzanne Collins', 'Fiction', '9780439023481', 'Scholastic Press', 2008, 4.3, 7, 5, 2, 'A dystopian novel about survival in a brutal competition.'),
  book('The Da Vinci Code', 'Dan Brown', 'Fiction', '9780307474278', 'Anchor', 2003, 4.1, 6, 4, 2, 'A mystery thriller involving art, history, and secret societies.'),
  book('The Kite Runner', 'Khaled Hosseini', 'Fiction', '9781594480003', 'Riverhead Books', 2003, 4.4, 6, 4, 2, 'A story of friendship, betrayal, and redemption in Afghanistan.'),
  book('The Book Thief', 'Markus Zusak', 'Fiction', '9780375842207', 'Knopf Books for Young Readers', 2007, 4.5, 5, 4, 1, 'A story of a young girl in Nazi Germany who steals books.'),
  book("The Handmaid's Tale", 'Margaret Atwood', 'Fiction', '9780385490818', 'Anchor', 1998, 4.3, 5, 4, 1, 'A dystopian novel set in a totalitarian society.'),
  book('The Road', 'Cormac McCarthy', 'Fiction', '9780307387899', 'Vintage', 2006, 4.2, 4, 3, 1, 'A post-apocalyptic tale of a father and son.'),
  book('Life of Pi', 'Yann Martel', 'Fiction', '9780156027328', 'Mariner Books', 2003, 4.2, 5, 4, 1, 'A young man stranded on a lifeboat with a Bengal tiger.'),
  book('The Shining', 'Stephen King', 'Fiction', '9780307743657', 'Anchor', 2012, 4.3, 5, 4, 1, 'A horror novel about a family in an isolated hotel.'),
  book('The Martian', 'Andy Weir', 'Fiction', '9780553418026', 'Broadway Books', 2014, 4.5, 6, 4, 2, 'An astronaut stranded on Mars fights to survive.'),
  book('Ready Player One', 'Ernest Cline', 'Fiction', '9780307887443', 'Broadway Books', 2011, 4.2, 5, 4, 1, 'A dystopian sci-fi adventure in a virtual reality world.'),
  book('The Silent Patient', 'Alex Michaelides', 'Fiction', '9781250301697', 'Celadon Books', 2019, 4.2, 6, 4, 2, 'A psychological thriller about a woman who stops speaking.'),
  book('Where the Crawdads Sing', 'Delia Owens', 'Fiction', '9780735219090', "G.P. Putnam's Sons", 2018, 4.4, 6, 4, 2, 'A coming-of-age story set in the marshes of North Carolina.'),
  book('The Night Circus', 'Erin Morgenstern', 'Fiction', '9780307744432', 'Anchor', 2012, 4.1, 4, 3, 1, 'A magical competition between two young illusionists.'),
  book('The Goldfinch', 'Donna Tartt', 'Fiction', '9780316055444', 'Little, Brown and Company', 2013, 4.1, 4, 3, 1, 'A young boy in New York who is haunted by a painting.'),

  // ===== History (10) =====
  book('The Rise and Fall of the Third Reich', 'William L. Shirer', 'History', '9781451651683', 'Simon & Schuster', 2011, 4.4, 5, 4, 1, 'A history of Nazi Germany.'),
  book('1776', 'David McCullough', 'History', '9780743226721', 'Simon & Schuster', 2005, 4.3, 5, 4, 1, 'The story of the year America was born.'),
  book('Team of Rivals', 'Doris Kearns Goodwin', 'History', '9780743270755', 'Simon & Schuster', 2006, 4.4, 4, 3, 1, 'The political genius of Abraham Lincoln.'),
  book('The Guns of August', 'Barbara W. Tuchman', 'History', '9780345476098', 'Presidio Press', 2004, 4.3, 4, 3, 1, 'The outbreak of World War I.'),
  book("A People's History of the United States", 'Howard Zinn', 'History', '9780062397348', 'Harper Perennial', 2015, 4.2, 5, 4, 1, 'American history from the perspective of the marginalized.'),
  book('Genghis Khan and the Making of the Modern World', 'Jack Weatherford', 'History', '9780609809648', 'Crown', 2005, 4.3, 4, 3, 1, 'The life and legacy of Genghis Khan.'),
  book('The Splendid and the Vile', 'Erik Larson', 'History', '9780385348713', 'Crown', 2020, 4.3, 5, 4, 1, 'A saga of Churchill, family, and defiance during the Blitz.'),
  book('The Warmth of Other Suns', 'Isabel Wilkerson', 'History', '9780679763888', 'Vintage', 2011, 4.5, 4, 3, 1, "The epic story of America's Great Migration."),
  book('The Silk Roads: A New History of the World', 'Peter Frankopan', 'History', '9781101912379', 'Vintage', 2017, 4.3, 5, 4, 1, 'A new history of the world through the lens of the Silk Roads.'),
  book('The Wright Brothers', 'David McCullough', 'History', '9781476728742', 'Simon & Schuster', 2015, 4.4, 4, 3, 1, 'The story of the pioneering aviators.'),

  // ===== Self-Help (10) =====
  book('The Four Agreements', 'Don Miguel Ruiz', 'Self-Help', '9781878424310', 'Amber-Allen Publishing', 1997, 4.3, 7, 5, 2, 'A practical guide to personal freedom.'),
  book('The Miracle Morning', 'Hal Elrod', 'Self-Help', '9780979019715', 'Hal Elrod International', 2012, 4.2, 6, 4, 2, 'The 6 habits that will transform your life before 8AM.'),
  book('Daring Greatly', 'Brené Brown', 'Self-Help', '9781592408412', 'Gotham Books', 2012, 4.3, 5, 4, 1, 'How the courage to be vulnerable transforms the way we live, love, parent, and lead.'),
  book('The Gifts of Imperfection', 'Brené Brown', 'Self-Help', '9781592858491', 'Hazelden Publishing', 2010, 4.2, 4, 3, 1, "Let go of who you think you're supposed to be and embrace who you are."),
  book('The 48 Laws of Power', 'Robert Greene', 'Self-Help', '9780140280197', 'Penguin Books', 2000, 4.2, 6, 4, 2, 'Amoral, cunning, ruthless, and instructive.'),
  book('Essentialism', 'Greg McKeown', 'Self-Help', '9780804137386', 'Crown Business', 2014, 4.2, 5, 4, 1, 'The disciplined pursuit of less.'),
  book('The Happiness Advantage', 'Shawn Achor', 'Self-Help', '9780307591548', 'Crown Business', 2010, 4.2, 5, 4, 1, 'The seven principles of positive psychology that fuel success and performance at work.'),
  book('The 5 Love Languages', 'Gary Chapman', 'Self-Help', '9780802412706', 'Northfield Publishing', 2015, 4.3, 6, 4, 2, 'The secret to love that lasts.'),
  book('The Power of Now', 'Eckhart Tolle', 'Self-Help', '9781577314806', 'New World Library', 2004, 4.3, 6, 4, 2, 'A guide to spiritual enlightenment.'),
  book('The Untethered Soul', 'Michael A. Singer', 'Self-Help', '9781572245372', 'New Harbinger Publications', 2007, 4.4, 5, 4, 1, 'The journey beyond yourself.'),

  // ===== Science (10) =====
  book('A Short History of Nearly Everything', 'Bill Bryson', 'Science', '9780767908184', 'Broadway Books', 2003, 4.4, 6, 4, 2, 'A journey through the history of science.'),
  book('The Elegant Universe', 'Brian Greene', 'Science', '9780393338101', 'W. W. Norton & Company', 2010, 4.3, 5, 4, 1, 'Superstrings, hidden dimensions, and the quest for the ultimate theory.'),
  book('The Gene: An Intimate History', 'Siddhartha Mukherjee', 'Science', '9781476733500', 'Scribner', 2016, 4.4, 5, 4, 1, 'An intimate history of the gene.'),
  book('The Emperor of All Maladies', 'Siddhartha Mukherjee', 'Science', '9781439170915', 'Scribner', 2010, 4.5, 5, 4, 1, 'A biography of cancer.'),
  book('Astrophysics for People in a Hurry', 'Neil deGrasse Tyson', 'Science', '9780393609394', 'W. W. Norton & Company', 2017, 4.4, 6, 4, 2, 'A concise introduction to the universe.'),
  book('The Hidden Life of Trees', 'Peter Wohlleben', 'Science', '9781771642481', 'Greystone Books', 2016, 4.3, 5, 4, 1, 'What they feel, how they communicate.'),
  book('The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 'Science', '9781400052189', 'Crown', 2010, 4.4, 5, 4, 1, 'The story of HeLa cells and their impact on medicine.'),
  book('The Sixth Extinction', 'Elizabeth Kolbert', 'Science', '9780805092998', 'Henry Holt and Co.', 2014, 4.3, 4, 3, 1, 'An unnatural history of the sixth extinction.'),
  book('The Order of Time', 'Carlo Rovelli', 'Science', '9780735216105', 'Riverhead Books', 2018, 4.3, 4, 3, 1, 'A journey through the nature of time.'),
  book('The Fabric of the Cosmos', 'Brian Greene', 'Science', '9780375727207', 'Vintage', 2005, 4.3, 4, 3, 1, 'Space, time, and the texture of reality.'),

  // ===== Business (10) =====
  book('The 4-Hour Workweek', 'Timothy Ferriss', 'Business', '9780307465351', 'Crown Archetype', 2007, 4.1, 6, 4, 2, 'Escape 9-5, live anywhere, and join the new rich.'),
  book('The Lean Startup', 'Eric Ries', 'Business', '9780307887894', 'Crown Business', 2011, 4.3, 7, 5, 2, "How today's entrepreneurs use continuous innovation to create radically successful businesses."),
  book('Measure What Matters', 'John Doerr', 'Business', '9780525536222', 'Portfolio', 2018, 4.3, 5, 4, 1, 'How Google, Bono, and the Gates Foundation rock the world with OKRs.'),
  book('The Personal MBA', 'Josh Kaufman', 'Business', '9781591845577', 'Portfolio', 2010, 4.2, 5, 4, 1, 'Master the art of business.'),
  book('Blue Ocean Strategy', 'W. Chan Kim', 'Business', '9781625274496', 'Harvard Business Review Press', 2015, 4.2, 5, 4, 1, 'How to create uncontested market space and make the competition irrelevant.'),
  book('The Effective Executive', 'Peter F. Drucker', 'Business', '9780060833459', 'HarperBusiness', 2006, 4.3, 5, 4, 1, 'The definitive guide to getting the right things done.'),
  book('The Art of War', 'Sun Tzu', 'Business', '9781590302255', 'Shambhala', 2003, 4.3, 6, 4, 2, 'The ancient classic on strategy and tactics.'),
  book('The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Business', '9781451639612', 'Simon & Schuster', 2013, 4.3, 6, 4, 2, 'Powerful lessons in personal change.'),
  book('The Innovator\'s Dilemma', 'Clayton M. Christensen', 'Business', '9781633691780', 'Harvard Business Review Press', 2016, 4.3, 5, 4, 1, 'When new technologies cause great firms to fail.'),
  book('The E-Myth Revisited', 'Michael E. Gerber', 'Business', '9780887307287', 'HarperCollins', 1995, 4.2, 4, 3, 1, "Why most small businesses don't work and what to do about it."),

  // ===== Biography (10) =====
  book('Elon Musk', 'Ashlee Vance', 'Biography', '9780062301239', 'Ecco', 2015, 4.3, 6, 4, 2, 'Tesla, SpaceX, and the quest for a fantastic future.'),
  book('The Autobiography of Benjamin Franklin', 'Benjamin Franklin', 'Biography', '9780486290737', 'Dover Publications', 1996, 4.2, 4, 3, 1, 'The autobiography of one of America\'s founding fathers.'),
  book('I Am Malala', 'Malala Yousafzai', 'Biography', '9780316322409', 'Little, Brown and Company', 2013, 4.4, 5, 4, 1, 'The girl who stood up for education and was shot by the Taliban.'),
  book('The Story of My Life', 'Helen Keller', 'Biography', '9780486292496', 'Dover Publications', 1996, 4.3, 4, 3, 1, 'The autobiography of Helen Keller.'),
  book('Alexander Hamilton', 'Ron Chernow', 'Biography', '9780143034759', 'Penguin Books', 2005, 4.4, 5, 4, 1, 'The biography that inspired the musical.'),
  book('The Wright Brothers', 'David McCullough', 'Biography', '9781476728742', 'Simon & Schuster', 2015, 4.4, 4, 3, 1, 'The story of the pioneering aviators.'),
  book('Leonardo da Vinci', 'Walter Isaacson', 'Biography', '9781501139154', 'Simon & Schuster', 2017, 4.5, 6, 4, 2, 'The biography of the ultimate Renaissance man.'),
  book('The Glass Castle', 'Jeannette Walls', 'Biography', '9780743247542', 'Scribner', 2005, 4.3, 5, 4, 1, 'A memoir of a dysfunctional but loving family.'),
  book('When Breath Becomes Air', 'Paul Kalanithi', 'Biography', '9780812988406', 'Random House', 2016, 4.5, 5, 4, 1, 'A neurosurgeon\'s journey through life and death.'),
  book('Educated', 'Tara Westover', 'Biography', '9780399590504', 'Random House', 2018, 4.4, 6, 4, 2, 'A memoir about a young girl who leaves her survivalist family.'),

  // ===== Psychology (10) =====
  book('The Body Keeps the Score', 'Bessel van der Kolk', 'Psychology', '9780143127741', 'Penguin Books', 2015, 4.5, 6, 4, 2, 'Brain, mind, and body in the healing of trauma.'),
  book('Emotional Intelligence', 'Daniel Goleman', 'Psychology', '9780553383713', 'Bantam', 2006, 4.2, 6, 4, 2, 'Why it can matter more than IQ.'),
  book('Flow: The Psychology of Optimal Experience', 'Mihaly Csikszentmihalyi', 'Psychology', '9780061339202', 'Harper Perennial', 2008, 4.3, 5, 4, 1, 'The psychology of optimal experience.'),
  book('The Psychology of Selling', 'Brian Tracy', 'Psychology', '9780814474561', 'AMACOM', 2006, 4.1, 4, 3, 1, 'How to sell more, easier, and faster than you ever thought possible.'),
  book('Quiet: The Power of Introverts', 'Susan Cain', 'Psychology', '9780307352156', 'Crown', 2012, 4.3, 6, 4, 2, 'The power of introverts in a world that can\'t stop talking.'),
  book('The Paradox of Choice', 'Barry Schwartz', 'Psychology', '9780060005696', 'Harper Perennial', 2005, 4.1, 4, 3, 1, 'Why more is less.'),
  book('Stumbling on Happiness', 'Daniel Gilbert', 'Psychology', '9781400077427', 'Vintage', 2007, 4.1, 4, 3, 1, 'A journey through the science of happiness.'),
  book('The Lucifer Effect', 'Philip Zimbardo', 'Psychology', '9781400064113', 'Random House', 2007, 4.2, 4, 3, 1, 'Understanding how good people turn evil.'),
  book('Thinking in Bets', 'Annie Duke', 'Psychology', '9780735216358', 'Portfolio', 2018, 4.2, 5, 4, 1, 'Making smarter decisions when you don\'t have all the facts.'),
  book('The Righteous Mind', 'Jonathan Haidt', 'Psychology', '9780307455772', 'Vintage', 2013, 4.3, 5, 4, 1, 'Why good people are divided by politics and religion.'),

  // ===== Finance (10) =====
  book('The Total Money Makeover', 'Dave Ramsey', 'Finance', '9781595555274', 'Thomas Nelson', 2013, 4.2, 6, 4, 2, 'A proven plan for financial fitness.'),
  book('The Little Book of Common Sense Investing', 'John C. Bogle', 'Finance', '9781119404507', 'Wiley', 2017, 4.4, 5, 4, 1, 'The only way to guarantee your fair share of stock market returns.'),
  book('The Simple Path to Wealth', 'JL Collins', 'Finance', '9781533667924', 'CreateSpace', 2016, 4.5, 5, 4, 1, 'Your road map to financial independence and a rich, free life.'),
  book('The Millionaire Next Door', 'Thomas J. Stanley', 'Finance', '9781589795471', 'Taylor Trade Publishing', 2010, 4.2, 6, 4, 2, 'The surprising secrets of America\'s wealthy.'),
  book('The Automatic Millionaire', 'David Bach', 'Finance', '9780767923781', 'Crown Business', 2005, 4.1, 4, 3, 1, 'A powerful one-step plan to live and finish rich.'),
  book('The Bogleheads\' Guide to Investing', 'Taylor Larimore', 'Finance', '9781118921289', 'Wiley', 2014, 4.3, 4, 3, 1, 'A practical guide to investing.'),
  book('The Intelligent Investor', 'Benjamin Graham', 'Finance', '9780060555665', 'HarperBusiness', 2006, 4.4, 6, 4, 2, 'The definitive book on value investing.'),
  book('The Richest Man in Babylon', 'George S. Clason', 'Finance', '9780451532366', 'Signet', 2004, 4.3, 5, 4, 1, 'The original classic on financial wisdom.'),
  book('The Barefoot Investor', 'Scott Pape', 'Finance', '9780730327000', 'Wiley', 2016, 4.3, 5, 4, 1, 'The only money guide you\'ll ever need.'),
  book('The Index Card', 'Helaine Olen', 'Finance', '9781591847687', 'Portfolio', 2016, 4.1, 4, 3, 1, 'Why personal finance doesn\'t have to be complicated.'),

  // ===== Non-Fiction (10) =====
  book('Into the Wild', 'Jon Krakauer', 'Non-Fiction', '9780385486804', 'Anchor', 1997, 4.2, 5, 4, 1, 'The story of Christopher McCandless and his journey into the Alaskan wilderness.'),
  book('The Devil in the White City', 'Erik Larson', 'Non-Fiction', '9780375725609', 'Vintage', 2004, 4.3, 5, 4, 1, 'Murder, magic, and madness at the fair that changed America.'),
  book('Freakonomics', 'Steven D. Levitt', 'Non-Fiction', '9780060731335', 'William Morrow', 2006, 4.1, 6, 4, 2, 'A rogue economist explores the hidden side of everything.'),
  book('Outliers', 'Malcolm Gladwell', 'Non-Fiction', '9780316017930', 'Little, Brown and Company', 2008, 4.2, 6, 4, 2, 'The story of success.'),
  book('The Tipping Point', 'Malcolm Gladwell', 'Non-Fiction', '9780316346627', 'Back Bay Books', 2002, 4.1, 5, 4, 1, 'How little things can make a big difference.'),
  book('Blink', 'Malcolm Gladwell', 'Non-Fiction', '9780316010665', 'Back Bay Books', 2007, 4.0, 5, 4, 1, 'The power of thinking without thinking.'),
  book('The Omnivore\'s Dilemma', 'Michael Pollan', 'Non-Fiction', '9780143038580', 'Penguin Books', 2007, 4.2, 4, 3, 1, 'A natural history of four meals.'),
  book('In Cold Blood', 'Truman Capote', 'Non-Fiction', '9780679745587', 'Vintage', 1994, 4.3, 4, 3, 1, 'The true story of a multiple murder and its consequences.'),
  book('The Glass Castle', 'Jeannette Walls', 'Non-Fiction', '9780743247542', 'Scribner', 2005, 4.3, 5, 4, 1, 'A memoir of a dysfunctional but loving family.'),
  book('The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 'Non-Fiction', '9781400052189', 'Crown', 2010, 4.4, 5, 4, 1, 'The story of HeLa cells and their impact on medicine.'),
];

module.exports = { NEW_BOOKS };