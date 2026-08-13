import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import HeroSection, { SPOTLIGHT_MOVIES_DATA } from './HeroSection';
import { playSound } from '../services/soundEffects';
import { fetchDynamicCategoryTitles } from '../services/movieApi';

export const SPOTLIGHT_MOVIES = SPOTLIGHT_MOVIES_DATA;

export const GENRE_LIST = [
  {
    name: 'Action',
    query: 'Action',
    bg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Sci-Fi',
    query: 'Sci-Fi',
    bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'TV Series',
    query: 'TV Series',
    bg: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Anime',
    query: 'Anime',
    bg: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Drama',
    query: 'Drama',
    bg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Thriller',
    query: 'Thriller',
    bg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Crime',
    query: 'Crime',
    bg: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Comedy',
    query: 'Comedy',
    bg: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Animation',
    query: 'Animation',
    bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Horror',
    query: 'Horror',
    bg: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Adventure',
    query: 'Adventure',
    bg: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Fantasy',
    query: 'Fantasy',
    bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Documentary',
    query: 'Documentary',
    bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Mystery',
    query: 'Mystery',
    bg: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Romance',
    query: 'Romance',
    bg: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'
  }
];

// Expanded Database of 2024-2026 Hits (Fast TMDB CDN - 20 Titles)
const LATEST_RELEASES_ALL = [
  { id: 'tt6263850', imdbID: 'tt6263850', name: 'Deadpool & Wolverine', year: '2024', type: 'movie', imdbRating: '7.8', poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
  { id: 'tt15239678', imdbID: 'tt15239678', name: 'Dune: Part Two', year: '2024', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 'tt22022452', imdbID: 'tt22022452', name: 'Inside Out 2', year: '2024', type: 'movie', imdbRating: '7.6', poster: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg' },
  { id: 'tt9218128', imdbID: 'tt9218128', name: 'Gladiator II', year: '2024', type: 'movie', imdbRating: '7.0', poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg' },
  { id: 'tt18411490', imdbID: 'tt18411490', name: 'Alien: Romulus', year: '2024', type: 'movie', imdbRating: '7.2', poster: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao8l3MieM4Ur0T8.jpg' },
  { id: 'tt11358390', imdbID: 'tt11358390', name: 'Kingdom of the Planet of the Apes', year: '2024', type: 'movie', imdbRating: '7.0', poster: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg' },
  { id: 'tt14539740', imdbID: 'tt14539740', name: 'Godzilla x Kong: The New Empire', year: '2024', type: 'movie', imdbRating: '6.1', poster: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg' },
  { id: 'tt11145118', imdbID: 'tt11145118', name: 'Twisters', year: '2024', type: 'movie', imdbRating: '6.6', poster: 'https://image.tmdb.org/t/p/w500/bYv0bU6G5Q9aCqO4xZp5Qz8w0M.jpg' },
  { id: 'tt11358394', imdbID: 'tt11358394', name: 'Furiosa: A Mad Max Saga', year: '2024', type: 'movie', imdbRating: '7.5', poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xUMZ51f.jpg' },
  { id: 'tt2049403', imdbID: 'tt2049403', name: 'Beetlejuice Beetlejuice', year: '2024', type: 'movie', imdbRating: '6.8', poster: 'https://image.tmdb.org/t/p/w500/kKgQzkUCUm08qALJQQqH52nCqK.jpg' },
  { id: 'tt5177120', imdbID: 'tt5177120', name: 'Moana 2', year: '2024', type: 'movie', imdbRating: '7.1', poster: 'https://image.tmdb.org/t/p/w500/aLVkiINl0eR747b08J7PR42nRhT.jpg' },
  { id: 'tt1462764', imdbID: 'tt1462764', name: 'Wicked', year: '2024', type: 'movie', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/xDGbZ0JJ3mYaGKy4NzdAq8GTPNx.jpg' },
  { id: 'tt6495056', imdbID: 'tt6495056', name: 'Challengers', year: '2024', type: 'movie', imdbRating: '7.2', poster: 'https://image.tmdb.org/t/p/w500/H6vYQ3Ki5AagHgGmz04k2Vd406.jpg' },
  { id: 'tt13375076', imdbID: 'tt13375076', name: 'Bad Boys: Ride or Die', year: '2024', type: 'movie', imdbRating: '6.7', poster: 'https://image.tmdb.org/t/p/w500/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg' },
  { id: 'tt23567796', imdbID: 'tt23567796', name: 'Smile 2', year: '2024', type: 'movie', imdbRating: '6.9', poster: 'https://image.tmdb.org/t/p/w500/aE85MnPIvK1j4GzVbW5c1qQW8f0.jpg' },
  { id: 'tt21692408', imdbID: 'tt21692408', name: 'Kung Fu Panda 4', year: '2024', type: 'movie', imdbRating: '6.7', poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
  { id: 'tt17279496', imdbID: 'tt17279496', name: 'Civil War', year: '2024', type: 'movie', imdbRating: '7.1', poster: 'https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg' },
  { id: 'tt1684562', imdbID: 'tt1684562', name: 'The Fall Guy', year: '2024', type: 'movie', imdbRating: '6.9', poster: 'https://image.tmdb.org/t/p/w500/aBkqu79NaI39q2Fs5J50xRTrFO.jpg' },
  { id: 'tt23468450', imdbID: 'tt23468450', name: 'Longlegs', year: '2024', type: 'movie', imdbRating: '6.7', poster: 'https://image.tmdb.org/t/p/w500/5aj8vVGFwGVbQSVUt8dp2r2CGYy.jpg' },
  { id: 'tt5040012', imdbID: 'tt5040012', name: 'Nosferatu', year: '2024', type: 'movie', imdbRating: '7.3', poster: 'https://image.tmdb.org/t/p/w500/5qGIxdEO841C0qYQ5VoiF6k38b.jpg' }
];

// Expanded Database of Popular All-Time Hits (Fast TMDB CDN - 20 Titles)
const POPULAR_HITS_ALL = [
  { id: 'tt1375666', imdbID: 'tt1375666', name: 'Inception', year: '2010', type: 'movie', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
  { id: 'tt0468569', imdbID: 'tt0468569', name: 'The Dark Knight', year: '2008', type: 'movie', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { id: 'tt0816692', imdbID: 'tt0816692', name: 'Interstellar', year: '2014', type: 'movie', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 'tt4154796', imdbID: 'tt4154796', name: 'Avengers: Endgame', year: '2019', type: 'movie', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg' },
  { id: 'tt0109830', imdbID: 'tt0109830', name: 'Forrest Gump', year: '1994', type: 'movie', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg' },
  { id: 'tt0133093', imdbID: 'tt0133093', name: 'The Matrix', year: '1999', type: 'movie', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
  { id: 'tt0111161', imdbID: 'tt0111161', name: 'The Shawshank Redemption', year: '1994', type: 'movie', imdbRating: '9.3', poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
  { id: 'tt0120737', imdbID: 'tt0120737', name: 'The Lord of the Rings: The Fellowship of the Ring', year: '2001', type: 'movie', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg' },
  { id: 'tt0167260', imdbID: 'tt0167260', name: 'The Lord of the Rings: The Return of the King', year: '2003', type: 'movie', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg' },
  { id: 'tt1877830', imdbID: 'tt1877830', name: 'The Batman', year: '2022', type: 'movie', imdbRating: '7.8', poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg' },
  { id: 'tt6751668', imdbID: 'tt6751668', name: 'Parasite', year: '2019', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { id: 'tt0137523', imdbID: 'tt0137523', name: 'Fight Club', year: '1999', type: 'movie', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
  { id: 'tt0848228', imdbID: 'tt0848228', name: 'The Avengers', year: '2012', type: 'movie', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg' },
  { id: 'tt0172495', imdbID: 'tt0172495', name: 'Gladiator', year: '2000', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg' },
  { id: 'tt0499549', imdbID: 'tt0499549', name: 'Avatar', year: '2009', type: 'movie', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgxmukK.jpg' },
  { id: 'tt1745960', imdbID: 'tt1745960', name: 'Top Gun: Maverick', year: '2022', type: 'movie', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg' },
  { id: 'tt0120338', imdbID: 'tt0120338', name: 'Titanic', year: '1997', type: 'movie', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
  { id: 'tt4633694', imdbID: 'tt4633694', name: 'Spider-Man: Into the Spider-Verse', year: '2018', type: 'movie', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg' },
  { id: 'tt9362722', imdbID: 'tt9362722', name: 'Spider-Man: Across the Spider-Verse', year: '2023', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
  { id: 'tt15398776', imdbID: 'tt15398776', name: 'Oppenheimer', year: '2023', type: 'movie', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' }
];

// Expanded Database of TV Series (Fast TMDB CDN - 20 Titles)
const TOP_SERIES_ALL = [
  { id: 'tt2788316', imdbID: 'tt2788316', name: 'Shōgun', year: '2024–Present', type: 'series', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg' },
  { id: 'tt12637874', imdbID: 'tt12637874', name: 'Fallout', year: '2024–Present', type: 'series', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/AnsZuLpE8Jj571wQpLz267rW1bN.jpg' },
  { id: 'tt11198330', imdbID: 'tt11198330', name: 'House of the Dragon', year: '2022–Present', type: 'series', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/t9Xke57t09Q5dqq394An2256ZGt.jpg' },
  { id: 'tt14452776', imdbID: 'tt14452776', name: 'The Bear', year: '2022–Present', type: 'series', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/sHFlbQSI8k6aT8J4Pj5L2sF5y3q.jpg' },
  { id: 'tt0903747', imdbID: 'tt0903747', name: 'Breaking Bad', year: '2008–2013', type: 'series', imdbRating: '9.5', poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJImg.jpg' },
  { id: 'tt4574334', imdbID: 'tt4574334', name: 'Stranger Things', year: '2016–2025', type: 'series', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg' },
  { id: 'tt0944947', imdbID: 'tt0944947', name: 'Game of Thrones', year: '2011–2019', type: 'series', imdbRating: '9.2', poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg' },
  { id: 'tt3581920', imdbID: 'tt3581920', name: 'The Last of Us', year: '2023–Present', type: 'series', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg' },
  { id: 'tt8772296', imdbID: 'tt8772296', name: 'Euphoria', year: '2019–Present', type: 'series', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/3Q0hd3heuW4cmqRRKEURnRptTYE.jpg' },
  { id: 'tt1190634', imdbID: 'tt1190634', name: 'The Boys', year: '2019–Present', type: 'series', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnNDBpQIavBk8.jpg' },
  { id: 'tt13443470', imdbID: 'tt13443470', name: 'Wednesday', year: '2022–Present', type: 'series', imdbRating: '8.1', poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg' },
  { id: 'tt10919420', imdbID: 'tt10919420', name: 'Squid Game', year: '2021–Present', type: 'series', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg' },
  { id: 'tt2356777', imdbID: 'tt2356777', name: 'True Detective', year: '2014–Present', type: 'series', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/cuV2O5ZyDLHSOWzg9nOdIvDpG8P.jpg' },
  { id: 'tt7366338', imdbID: 'tt7366338', name: 'Chernobyl', year: '2019', type: 'series', imdbRating: '9.3', poster: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg' },
  { id: 'tt2442560', imdbID: 'tt2442560', name: 'Peaky Blinders', year: '2013–2022', type: 'series', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKV9hkRpukQw.jpg' },
  { id: 'tt11280740', imdbID: 'tt11280740', name: 'Severance', year: '2022–Present', type: 'series', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/pPHpeIqlzp6EG64Tez7UfdA1W5k.jpg' },
  { id: 'tt15474916', imdbID: 'tt15474916', name: 'The Penguin', year: '2024–Present', type: 'series', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/uSZvP3t481Xn9JqY8m17fH0YpT.jpg' },
  { id: 'tt9140554', imdbID: 'tt9140554', name: 'Loki', year: '2021–2023', type: 'series', imdbRating: '8.2', poster: 'https://image.tmdb.org/t/p/w500/voHUmluYmKyleFk9a3xgUtKvPhH.jpg' },
  { id: 'tt7660850', imdbID: 'tt7660850', name: 'Succession', year: '2018–2023', type: 'series', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/7TbcY4i87FvI8qFqK0e20H72XlU.jpg' },
  { id: 'tt3032476', imdbID: 'tt3032476', name: 'Better Call Saul', year: '2015–2022', type: 'series', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHVRL9nlS5FG0mR7VI.jpg' }
];

// Expanded Database of Anime Masterpieces (Fast TMDB CDN - 32 Titles)
const TOP_ANIME_ALL = [
  { id: 'tt21209876', imdbID: 'tt21209876', name: 'Solo Leveling', year: '2024–', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuCYJMo8d6.jpg' },
  { id: 'tt9335498', imdbID: 'tt9335498', name: 'Demon Slayer', year: '2019–', type: 'anime', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg' },
  { id: 'tt11126994', imdbID: 'tt11126994', name: 'Arcane', year: '2021–2024', type: 'anime', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg' },
  { id: 'tt2560140', imdbID: 'tt2560140', name: 'Attack on Titan', year: '2013–2023', type: 'anime', imdbRating: '9.1', poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg' },
  { id: 'tt12343534', imdbID: 'tt12343534', name: 'Jujutsu Kaisen', year: '2020–', type: 'anime', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/fHpHzqS2nJz5kP5O7u1H6D9g3e.jpg' },
  { id: 'tt0245429', imdbID: 'tt0245429', name: 'Spirited Away', year: '2001', type: 'anime', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
  { id: 'tt0388629', imdbID: 'tt0388629', name: 'One Piece', year: '1999–', type: 'anime', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/cMD9Ygz11yjYnzGQcyZOE9MCuf9.jpg' },
  { id: 'tt5311514', imdbID: 'tt5311514', name: 'Your Name.', year: '2016', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6ditWzh8EFsc.jpg' },
  { id: 'tt0877057', imdbID: 'tt0877057', name: 'Death Note', year: '2006–2007', type: 'anime', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/tCZFjgRlHcwj2iAmYZqL1SuU69E.jpg' },
  { id: 'tt12456908', imdbID: 'tt12456908', name: 'Chainsaw Man', year: '2022–', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/npdB6eFz4qwIRTNrzjVh5qnZgHM.jpg' },
  { id: 'tt0347149', imdbID: 'tt0347149', name: "Howl's Moving Castle", year: '2004', type: 'anime', imdbRating: '8.2', poster: 'https://image.tmdb.org/t/p/w500/6p0q21LGLD3bUj1oK9U9e9e1q7.jpg' },
  { id: 'tt13556424', imdbID: 'tt13556424', name: 'Spy x Family', year: '2022–', type: 'anime', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/3H1iE5Wf93e3d2m1c3c2e1a3b4.jpg' },
  { id: 'tt1972828', imdbID: 'tt1972828', name: 'Hunter x Hunter', year: '2011–2014', type: 'anime', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/ucmpFdYXzNxXiFmRkJc2g6qWn2F.jpg' },
  { id: 'tt0409591', imdbID: 'tt0409591', name: 'Naruto', year: '2002–2007', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/vauC6Vo9AgYQ5JwNE8Y0ElM4vvK.jpg' },
  { id: 'tt0988824', imdbID: 'tt0988824', name: 'Fullmetal Alchemist: Brotherhood', year: '2009–2010', type: 'anime', imdbRating: '9.1', poster: 'https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7p19UPF92vmvSm0.jpg' },
  { id: 'tt12590266', imdbID: 'tt12590266', name: 'Cyberpunk: Edgerunners', year: '2022', type: 'anime', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/7JkW8fV9Qh99s10wQkZ7qgC4lq.jpg' },
  { id: 'tt0119698', imdbID: 'tt0119698', name: 'Princess Mononoke', year: '1997', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/cMYCDADoLKLbB83g4WnJegaZflC.jpg' },
  { id: 'tt14989920', imdbID: 'tt14989920', name: 'Bleach: Thousand-Year Blood War', year: '2022–', type: 'anime', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/mCDc84F2xRkL2M0k5b5gZ8b3L.jpg' },
  { id: 'tt16428256', imdbID: 'tt16428256', name: 'Suzume', year: '2022', type: 'anime', imdbRating: '7.7', poster: 'https://image.tmdb.org/t/p/w500/vIewbE8zR34N53hQyLqgZ7m9.jpg' },
  { id: 'tt22064098', imdbID: 'tt22064098', name: "Frieren: Beyond Journey's End", year: '2023–', type: 'anime', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/dqZENchTd7lp5zhthtwqCuQ73.jpg' },
  { id: 'tt10233448', imdbID: 'tt10233448', name: 'Vinland Saga', year: '2019–', type: 'anime', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/v1LlrYqFpA9gA6H6B2t1bY3d3g4.jpg' },
  { id: 'tt5897304', imdbID: 'tt5897304', name: 'Mob Psycho 100', year: '2016–2022', type: 'anime', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/1X67eT3P1J7Y8pA3X2fB2w3b3g5.jpg' },
  { id: 'tt1910272', imdbID: 'tt1910272', name: 'Steins;Gate', year: '2011', type: 'anime', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/5lhvL4lZgJz3zLh0m4p2r5s6t7.jpg' },
  { id: 'tt0213338', imdbID: 'tt0213338', name: 'Cowboy Bebop', year: '1998–1999', type: 'anime', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/7aZ8gJp4X2w3b1b5e6f7a8b9c0.jpg' },
  { id: 'tt0112159', imdbID: 'tt0112159', name: 'Neon Genesis Evangelion', year: '1995–1996', type: 'anime', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/9eN6bB3aD1e2f3g4h5j6k7l8m9.jpg' },
  { id: 'tt3504362', imdbID: 'tt3504362', name: 'Haikyu!!', year: '2014–2020', type: 'anime', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/3G0hd3heuW4cmqRRKEURnRptTYE.jpg' },
  { id: 'tt4311894', imdbID: 'tt4311894', name: 'Death Parade', year: '2015', type: 'anime', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/8VG8fDNiy5087IRDoLdu2KB9Wki.jpg' },
  { id: 'tt3741634', imdbID: 'tt3741634', name: 'Tokyo Ghoul', year: '2014', type: 'anime', imdbRating: '7.8', poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJsk9UO.jpg' },
  { id: 'tt0994314', imdbID: 'tt0994314', name: 'Code Geass: Lelouch of the Rebellion', year: '2006–2008', type: 'anime', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg' },
  { id: 'tt7708342', imdbID: 'tt7708342', name: 'Violet Evergarden', year: '2018', type: 'anime', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg' },
  { id: 'tt0214341', imdbID: 'tt0214341', name: 'Dragon Ball Z', year: '1989–1996', type: 'anime', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cDK6.jpg' },
  { id: 'tt4508902', imdbID: 'tt4508902', name: 'One-Punch Man', year: '2015–2019', type: 'anime', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' }
];

// Expanded Database of Sci-Fi & Cyberpunk Hits (Fast TMDB CDN - 18 Titles)
const SCIFI_EXPANDED_ALL = [
  { id: 'tt0816692', imdbID: 'tt0816692', name: 'Interstellar', year: '2014', type: 'movie', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 'tt1375666', imdbID: 'tt1375666', name: 'Inception', year: '2010', type: 'movie', imdbRating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' },
  { id: 'tt0133093', imdbID: 'tt0133093', name: 'The Matrix', year: '1999', type: 'movie', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
  { id: 'tt15239678', imdbID: 'tt15239678', name: 'Dune: Part Two', year: '2024', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
  { id: 'tt1856101', imdbID: 'tt1856101', name: 'Blade Runner 2049', year: '2017', type: 'movie', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { id: 'tt2543164', imdbID: 'tt2543164', name: 'Arrival', year: '2016', type: 'movie', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg' },
  { id: 'tt1631867', imdbID: 'tt1631867', name: 'Edge of Tomorrow', year: '2014', type: 'movie', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/xjw50hOZaPhq979GJBGHjyPv75c.jpg' },
  { id: 'tt0078748', imdbID: 'tt0078748', name: 'Alien', year: '1979', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg' },
  { id: 'tt0090605', imdbID: 'tt0090605', name: 'Aliens', year: '1986', type: 'movie', imdbRating: '8.4', poster: 'https://image.tmdb.org/t/p/w500/r1x5o90h4945uw7o9V82t7B5K.jpg' },
  { id: 'tt0062622', imdbID: 'tt0062622', name: '2001: A Space Odyssey', year: '1968', type: 'movie', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69UmK1A49rP642m9.jpg' },
  { id: 'tt3659388', imdbID: 'tt3659388', name: 'The Martian', year: '2015', type: 'movie', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/5BHuvQ6p9kL0eamz37Q8oP0q6.jpg' },
  { id: 'tt1454468', imdbID: 'tt1454468', name: 'Gravity', year: '2013', type: 'movie', imdbRating: '7.7', poster: 'https://image.tmdb.org/t/p/w500/4p1nVq3zF0kL1R6O7oFk5j8R.jpg' },
  { id: 'tt0470752', imdbID: 'tt0470752', name: 'Ex Machina', year: '2014', type: 'movie', imdbRating: '7.7', poster: 'https://image.tmdb.org/t/p/w500/btbSMBCH4saR3n0jKnQG1.jpg' },
  { id: 'tt1630029', imdbID: 'tt1630029', name: 'Avatar: The Way of Water', year: '2022', type: 'movie', imdbRating: '7.6', poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg' },
  { id: 'tt6723592', imdbID: 'tt6723592', name: 'Tenet', year: '2020', type: 'movie', imdbRating: '7.3', poster: 'https://image.tmdb.org/t/p/w500/aCIFMriQ2vt0F3m1Z6h.jpg' },
  { id: 'tt6791350', imdbID: 'tt6791350', name: 'Guardians of the Galaxy Vol. 3', year: '2023', type: 'movie', imdbRating: '7.9', poster: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN2Ydg3Ni0J0.jpg' },
  { id: 'tt1160419', imdbID: 'tt1160419', name: 'Dune', year: '2021', type: 'movie', imdbRating: '8.0', poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
  { id: 'tt1677720', imdbID: 'tt1677720', name: 'Ready Player One', year: '2018', type: 'movie', imdbRating: '7.4', poster: 'https://image.tmdb.org/t/p/w500/pU1ULUq8D3iRxl1fdX2lQI37vgh.jpg' }
];

// Expanded Database of Critic Acclaimed Masterpieces (Fast TMDB CDN - 20 Titles)
const CRITIC_RECOMMENDED_ALL = [
  { id: 'tt15398776', imdbID: 'tt15398776', name: 'Oppenheimer', year: '2023', type: 'movie', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { id: 'tt2788316', imdbID: 'tt2788316', name: 'Shōgun', year: '2024', type: 'series', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg' },
  { id: 'tt0110912', imdbID: 'tt0110912', name: 'Pulp Fiction', year: '1994', type: 'movie', imdbRating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { id: 'tt0068646', imdbID: 'tt0068646', name: 'The Godfather', year: '1972', type: 'movie', imdbRating: '9.2', poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 'tt0245429', imdbID: 'tt0245429', name: 'Spirited Away', year: '2001', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg' },
  { id: 'tt6751668', imdbID: 'tt6751668', name: 'Parasite', year: '2019', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { id: 'tt0071562', imdbID: 'tt0071562', name: 'The Godfather Part II', year: '1974', type: 'movie', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg' },
  { id: 'tt0102926', imdbID: 'tt0102926', name: 'The Silence of the Lambs', year: '1991', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg' },
  { id: 'tt0050083', imdbID: 'tt0050083', name: '12 Angry Men', year: '1957', type: 'movie', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg' },
  { id: 'tt0108052', imdbID: 'tt0108052', name: "Schindler's List", year: '1993', type: 'movie', imdbRating: '9.0', poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg' },
  { id: 'tt0076759', imdbID: 'tt0076759', name: 'Star Wars: Episode IV - A New Hope', year: '1977', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg' },
  { id: 'tt0114369', imdbID: 'tt0114369', name: 'Se7en', year: '1995', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJsk9UO.jpg' },
  { id: 'tt0120689', imdbID: 'tt0120689', name: 'The Green Mile', year: '1999', type: 'movie', imdbRating: '8.6', poster: 'https://image.tmdb.org/t/p/w500/8VG8fDNiy5087IRDoLdu2KB9Wki.jpg' },
  { id: 'tt0105236', imdbID: 'tt0105236', name: 'Reservoir Dogs', year: '1992', type: 'movie', imdbRating: '8.3', poster: 'https://image.tmdb.org/t/p/w500/xi8Iu6MuTySu9FGWj7Px2BkEgKG.jpg' },
  { id: 'tt0099685', imdbID: 'tt0099685', name: 'Goodfellas', year: '1990', type: 'movie', imdbRating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg' },
  { id: 'tt2582802', imdbID: 'tt2582802', name: 'Whiplash', year: '2014', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg' },
  { id: 'tt0477348', imdbID: 'tt0477348', name: 'No Country for Old Men', year: '2007', type: 'movie', imdbRating: '8.2', poster: 'https://image.tmdb.org/t/p/w500/6d5XOczHGSO5JgrwRuy7UrY19bR.jpg' },
  { id: 'tt0482571', imdbID: 'tt0482571', name: 'The Prestige', year: '2006', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg' },
  { id: 'tt0075314', imdbID: 'tt0075314', name: 'Taxi Driver', year: '1976', type: 'movie', imdbRating: '8.2', poster: 'https://image.tmdb.org/t/p/w500/ekstpH694DaGliUD8z69Y39I506.jpg' },
  { id: 'tt0407887', imdbID: 'tt0407887', name: 'The Departed', year: '2006', type: 'movie', imdbRating: '8.5', poster: 'https://image.tmdb.org/t/p/w500/nT97ifL22rVQ9vv91AzP09o8vCE.jpg' }
];

// Custom hook for natural, responsive, 1:1 physical drag scrolling
const useNaturalDragScroll = () => {
  const rowRef = React.useRef(null);
  const isDown = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftPos = React.useRef(0);
  const dragDistance = React.useRef(0);

  const onMouseDown = (e) => {
    // Only drag with primary left mouse button
    if (e.button !== 0 || !rowRef.current) return;
    isDown.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftPos.current = rowRef.current.scrollLeft;

    rowRef.current.style.cursor = 'grabbing';
    rowRef.current.style.scrollBehavior = 'auto'; // Immediate 1:1 response while dragging
  };

  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDown.current || !rowRef.current) return;
      const x = e.pageX - rowRef.current.offsetLeft;
      const walk = x - startX.current;
      dragDistance.current = Math.abs(walk);

      if (dragDistance.current > 3) {
        e.preventDefault();
      }

      rowRef.current.scrollLeft = scrollLeftPos.current - walk;
    };

    const handleGlobalMouseUp = () => {
      if (!isDown.current) return;
      isDown.current = false;
      if (rowRef.current) {
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.scrollBehavior = 'smooth';
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return { rowRef, onMouseDown, dragDistance };
};

// Reusable Horizontal Draggable Movie Carousel Component
const DraggableMovieRow = ({
  title,
  subtitle,
  movies,
  onSeeMore,
  seeMoreLabel,
  onSelectMovie,
  watchlist,
  onToggleWatchlist,
  handleImageError
}) => {
  const { rowRef, onMouseDown, dragDistance } = useNaturalDragScroll();

  const isWatchlisted = (movie) => {
    const movieId = movie.id || movie.imdbID;
    return watchlist.some((w) => (w.id || w.imdbID) === movieId);
  };

  return (
    <section className="home-section">
      <div className="section-title-row">
        <div>
          <h3 className="home-section-title">{title}</h3>
          {subtitle && (
            <span className="section-subtitle-tag" style={{ marginTop: '4px', display: 'inline-block' }}>
              {subtitle}
            </span>
          )}
        </div>

        {onSeeMore && (
          <button
            className="view-all-btn section-see-more-btn"
            onClick={() => {
              playSound('click');
              onSeeMore();
            }}
            type="button"
          >
            {seeMoreLabel || 'See More →'}
          </button>
        )}
      </div>

      {/* Natural Horizontal Draggable Row */}
      <div
        ref={rowRef}
        className="movie-cards-drag-row"
        onMouseDown={onMouseDown}
      >
        {movies.map((m) => (
          <div key={m.id || m.imdbID} className="carousel-movie-item">
            <MovieCard
              movie={m}
              onSelect={(selected) => {
                if (dragDistance.current < 6) {
                  onSelectMovie(selected);
                }
              }}
              onSelectMovie={(selected) => {
                if (dragDistance.current < 6) {
                  onSelectMovie(selected);
                }
              }}
              isWatchlisted={isWatchlisted(m)}
              onToggleWatchlist={onToggleWatchlist}
              onImageError={handleImageError}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

const UNIFORM_ROW_COUNT = 15;

const Sections = ({
  onSelectMovie,
  onSelectGenre,
  activeGenre,
  watchlist = [],
  onToggleWatchlist,
  onWatchTrailer
}) => {
  const [failedImages, setFailedImages] = useState(new Set());
  const { rowRef: genreRowRef, onMouseDown: onGenreMouseDown, dragDistance: genreDragDist } = useNaturalDragScroll();

  const [latestMovies, setLatestMovies] = useState(LATEST_RELEASES_ALL);
  const [popularMovies, setPopularMovies] = useState(POPULAR_HITS_ALL);
  const [tvSeries, setTvSeries] = useState(TOP_SERIES_ALL);
  const [animeList, setAnimeList] = useState(TOP_ANIME_ALL);
  const [scifiMovies, setScifiMovies] = useState(SCIFI_EXPANDED_ALL);
  const [criticMovies, setCriticMovies] = useState(CRITIC_RECOMMENDED_ALL);

  // Live Background Category Enrichment from Specific APIs (AniList, TVmaze, OMDb)
  useEffect(() => {
    let isMounted = true;

    const enrichCategories = async () => {
      try {
        const [liveSeries, liveAnime, liveLatest] = await Promise.allSettled([
          fetchDynamicCategoryTitles('series'),
          fetchDynamicCategoryTitles('anime'),
          fetchDynamicCategoryTitles('latest')
        ]);

        if (!isMounted) return;

        // Pure AniList Live Anime (exclusive dedicated anime API without old suggestions)
        if (liveAnime.status === 'fulfilled' && Array.isArray(liveAnime.value) && liveAnime.value.length > 0) {
          setAnimeList(liveAnime.value);
        }

        // TVmaze Live Series
        if (liveSeries.status === 'fulfilled' && Array.isArray(liveSeries.value) && liveSeries.value.length > 0) {
          setTvSeries((prev) => {
            const existingIds = new Set(prev.map((m) => m.id || m.imdbID));
            const fresh = liveSeries.value.filter((m) => !existingIds.has(m.id || m.imdbID));
            return [...prev, ...fresh];
          });
        }

        // Live 2024 Hits
        if (liveLatest.status === 'fulfilled' && Array.isArray(liveLatest.value) && liveLatest.value.length > 0) {
          setLatestMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id || m.imdbID));
            const fresh = liveLatest.value.filter((m) => !existingIds.has(m.id || m.imdbID));
            return [...prev, ...fresh];
          });
        }
      } catch {
        // Fallback safely
      }
    };

    enrichCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle image loading failures across categories
  const handleImageError = (id) => {
    if (!id) return;
    setFailedImages((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Helper to filter out any movie whose poster failed and slice to uniform exact count
  const getUniformRowMovies = (movieList) => {
    return (movieList || [])
      .filter((m) => m && m.poster && !failedImages.has(m.id || m.imdbID))
      .slice(0, UNIFORM_ROW_COUNT);
  };

  return (
    <div className="home-sections-container animate-fade-in">
      {/* =========================================================================
          MODULAR HERO SECTION: PANORAMIC THEATER & 3D POSTER DECK
          ========================================================================= */}
      <HeroSection
        onSelectMovie={onSelectMovie}
        onToggleWatchlist={onToggleWatchlist}
        watchlist={watchlist}
        onWatchTrailer={onWatchTrailer}
      />

      {/* =========================================================================
          1. CATEGORY & GENRE EXPLORER (Natural Draggable Single Line)
          ========================================================================= */}
      <section className="home-section">
        <div className="section-title-row">
          <div>
            <h3 className="home-section-title">
              Explore Genres & Collections
            </h3>
            <span className="section-subtitle-tag" style={{ marginTop: '4px', display: 'inline-block' }}>
              Drag horizontally to explore all cinema categories and curated collections
            </span>
          </div>
        </div>

        {/* Unified Natural Single Draggable Row */}
        <div
          ref={genreRowRef}
          className="genre-cards-drag-row"
          onMouseDown={onGenreMouseDown}
        >
          {GENRE_LIST.map((g) => {
            const isSelected = activeGenre === g.name;
            return (
              <div
                key={g.name}
                className={`genre-explore-card ${isSelected ? 'active' : ''}`}
                style={{ '--card-bg': `url(${g.bg})` }}
                onClick={() => {
                  if (genreDragDist.current < 6) {
                    playSound('click');
                    onSelectGenre(g.name);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectGenre(g.name);
                  }
                }}
              >
                <div className="genre-card-bg" />
                <div className="genre-card-overlay" />
                <div className="genre-card-content">
                  <span className="genre-card-name">{g.name}</span>
                  <span className="genre-card-arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          2. 2024-2026 LATEST RELEASES (Horizontal Single Line Draggable Carousel)
          ========================================================================= */}
      <DraggableMovieRow
        title="2024–2026 Modern Hits & Blockbusters"
        subtitle="Fresh theatrical & streaming releases — drag horizontally to explore 15 suggestions"
        movies={getUniformRowMovies(latestMovies)}
        onSeeMore={() => onSelectGenre('Action')}
        seeMoreLabel="See More 2024–2026 Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          3. POPULAR ALL-TIME HITS (Horizontal Single Line Draggable Carousel)
          ========================================================================= */}
      <DraggableMovieRow
        title="Popular All-Time Hits & Classics"
        subtitle="Audience favorites and legendary box office milestones — drag horizontally to explore 15 suggestions"
        movies={getUniformRowMovies(popularMovies)}
        onSeeMore={() => onSelectGenre('Drama')}
        seeMoreLabel="See More Popular Hits →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          4. TOP RATED TV SERIES & DRAMAS (Horizontal Single Line Draggable Carousel)
          ========================================================================= */}
      <DraggableMovieRow
        title="Top Rated TV Series & Dramas"
        subtitle="Multi-season shows powered by TVmaze Live metadata & episode guides — 15 suggestions"
        movies={getUniformRowMovies(tvSeries)}
        onSeeMore={() => onSelectGenre('TV Series')}
        seeMoreLabel="See More TV Shows →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          5. TOP ANIME SERIES & MASTERPIECES (AniList Dedicated API - 15 Suggestions)
          ========================================================================= */}
      <DraggableMovieRow
        title="Legendary Anime & Animation"
        subtitle="Live AniList HD catalog & Studio Ghibli masterpieces — 15 suggestions"
        movies={getUniformRowMovies(animeList)}
        onSeeMore={() => onSelectGenre('Anime')}
        seeMoreLabel="See More Anime →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          6. SCI-FI & SPACE ODYSSEYS (Horizontal Single Line Draggable Carousel)
          ========================================================================= */}
      <DraggableMovieRow
        title="Sci-Fi & Cyberpunk Odysseys"
        subtitle="Mind-bending cinematic journeys across galaxies, AI futures, and deep space — 15 suggestions"
        movies={getUniformRowMovies(scifiMovies)}
        onSeeMore={() => onSelectGenre('Sci-Fi')}
        seeMoreLabel="See More Sci-Fi →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />

      {/* =========================================================================
          7. CRITIC ACCLAIMED MASTERPIECES (Horizontal Single Line Draggable Carousel)
          ========================================================================= */}
      <DraggableMovieRow
        title="Critic Acclaimed Masterpieces"
        subtitle="Oscar winners, Golden Globe honorees, and Rotten Tomatoes certified fresh — 15 suggestions"
        movies={getUniformRowMovies(criticMovies)}
        onSeeMore={() => onSelectGenre('Drama')}
        seeMoreLabel="See More Masterpieces →"
        onSelectMovie={onSelectMovie}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        handleImageError={handleImageError}
      />
    </div>
  );
};

export default Sections;
