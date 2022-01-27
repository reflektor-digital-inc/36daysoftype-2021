import { Howl } from 'howler';
import BaseAudioController from '@utils/BaseAudioController';

const audiospriteManifest = {
  src : [
    '/sprites/audiosprite.ogg',
    '/sprites/audiosprite.mp3',
    '/sprites/audiosprite.ac3',
    '/sprites/audiosprite.m4a'
  ],
  sprite : {
    balloon_pop : [
      0,
      798.0725623582766
    ],
    bell_chime_1 : [
      2000,
      1846.1678004535145
    ],
    bell_chime_2 : [
      5000,
      1846.1678004535145
    ],
    bell_chime_3 : [
      8000,
      1846.1678004535145
    ],
    bell_fall_1 : [
      11000,
      1846.1678004535145
    ],
    bell_fall_2 : [
      14000,
      1846.1678004535145
    ],
    bell_fall_3 : [
      17000,
      1846.1678004535145
    ],
    'dull-beep-001' : [
      20000,
      461.5419501133786
    ],
    'dull-beep-002' : [
      22000,
      461.5419501133786
    ],
    'dull-beep-003' : [
      24000,
      461.5419501133786
    ],
    inflate : [
      26000,
      230.7709750566893
    ],
    splash_1 : [
      28000,
      611.4739229024941
    ],
    triangle_1 : [
      30000,
      1846.1678004535145
    ],
    triangle_2 : [
      33000,
      1846.1678004535145
    ],
    triangle_3 : [
      36000,
      1846.1678004535145
    ],
    triangle_4 : [
      39000,
      1846.1678004535145
    ],
    triangle_5 : [
      42000,
      1846.1678004535145
    ],
    unlock : [
      45000,
      1754.2630385487498
    ],
    forest_bells : [
      48000,
      37209.2970521542,
      true
    ],
    space_waves : [
      87000,
      59077.36961451246,
      true
    ]
  }
};

const audiospriteSound = new Howl(audiospriteManifest);

export const audiospriteSpriteNames = {
  balloon_pop : 'balloon_pop',
  bell_chime_1 : 'bell_chime_1',
  bell_chime_2 : 'bell_chime_2',
  bell_chime_3 : 'bell_chime_3',
  bell_fall_1 : 'bell_fall_1',
  bell_fall_2 : 'bell_fall_2',
  bell_fall_3 : 'bell_fall_3',
  'dull-beep-001' : 'dull-beep-001',
  'dull-beep-002' : 'dull-beep-002',
  'dull-beep-003' : 'dull-beep-003',
  inflate : 'inflate',
  splash_1 : 'splash_1',
  triangle_1 : 'triangle_1',
  triangle_2 : 'triangle_2',
  triangle_3 : 'triangle_3',
  triangle_4 : 'triangle_4',
  triangle_5 : 'triangle_5',
  unlock : 'unlock',
  forest_bells : 'forest_bells',
  space_waves : 'space_waves'
};

export default new BaseAudioController(audiospriteSound, audiospriteSpriteNames);
