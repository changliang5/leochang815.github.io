Order
-----------------

1. 关卡json -> tilesets
2. tilesets 文件（注意 tilesize）
3. 物体组 -> gid/type
4. 硬编码区域

Standardlize

- Ground: 0
- Chars: 100
- Objects: 200
- LargeObjects: 300

ID List
-----------------

Rotation in clockwise, using deg.

| Type           | 标准代码位 | 参数                                               | 物体              | 锚点      | 旋转点    |
| -------------- | ---------- | -------------------------------------------------- | ----------------- | --------- | --------- |
| -              | -1         | -                                                  | Air               | -         | -         |
| 0              | 0          | type=0                                             | Block             | -         | -         |
| 1              | 1          | type=1                                             | RB Triangle       | -         | -         |
| 2              | 2          | type=2                                             | LB Triangle       | -         | -         |
| 3              | 3          | type=3                                             | RT Triangle       | -         | -         |
| 4              | 4          | type=4                                             | LT Triangle       | -         | -         |
| 5              | 5          | type=5                                             | Water Pool        | -         | -         |
| 6              | 6          | type=6                                             | Lava Pool         | -         | -         |
| 7              | 7          | type=7                                             | Ooze              | -         | -         |
| 8              | 8          | type=8                                             | Half Down Slope   | -         | -         |
| 9              | 9          | type=9                                             | Half Up Slope     | -         | -         |
| -1             | 10         | type=-1                                            | Fake Block        | -         | -         |
| 11             | 11         | type=11                                            | Snowy RB Triangle | -         | -         |
| 12             | 12         | type=12                                            | Snowy LB Triangle | -         | -         |
| 13             | 13         | type=13                                            | Snowy Block       | -         | -         |
| 14             | 14         | type=14                                            | Ice Lake          | -         | -         |
| char           | 100        | char=fb                                            | Fireboy           | Feet      | -         |
| char           | 101        | char=wg                                            | Watergirl         | Feet      | -         |
| door           | 102        | char=fb                                            | Male WC           | Bottom    | -         |
| door           | 103        | char=wg                                            | Female WC         | Bottom    | -         |
| diamond        | 104        | char=fb                                            | Fire Diamond      | Bottom    | -         |
| diamond        | 105        | char=wg                                            | Water Diamond     | Bottom    | -         |
| diamond        | 106        | char=silver                                        | Puzzle Diamond    | Bottom    | -         |
| diamond        | 107        | char=fbwg                                          | Split Diamond     | Bottom    | -         |
| pusher         | 200        | group=0                                            | Button            | LB (0,-1) | -         |
| lever          | 201        | group=0,onis=1,startPos=-1                         | Lever             | Base      | -         |
| lever          | 202        | group=0,onis=-1,startPos=1                         | Lever             | Base      | -         |
| box            | 204        | -                                                  | Plastic Box       | LB (0,0)  | LB (0,0)  |
| beamer         | 205        | group=0,color=yellow,[initialState]=1              | Light Source      | LB (-1,0) | LB (-1,0) |
| rotmirror      | 206        | group=0,dir=1                                      | π/2 Mirror        | LB        | LB        |
| lightpusher    | 207        | group=0,color=yellow                               | Light Receiver    | LB (0,-1) | LB (0,-1) |
| ball           | 210        | -                                                  | Ball              | LB        | -         |
| infinitemirror | 211        | group=0                                            | Precise Mirror    | ^206      | ^206      |
| boxmirror      | 212        | -                                                  | Boxed Mirror      | LB (0,0)  | LB (0,0)  |
| boxheavy       | 213        | -                                                  | Metal Box         | LB (0,0)  | LB (0,0)  |
| timedpusher    | 214        | group=0,time=2000                                  | Timed Pusher      | ^200      | -         |
| wind           | 215        | group=0,length=10,[initialState]=1                 | Wind              | LB (-1,0) | LB(-1,0)  |
| portal         | 300        | group=0,inverted=false,portalId=0,[initialState]=1 | Portal            | Field LB  | Field LB  |
| portal         | 301        | group=0,inverted=true,portalId=0,[initialState]=1  | Portal            | Field LB  | Field LB  |
| wind           | 302        | group=0,length=10,[initialState]=1                 | Wind              | ^215      | ^215      |
| slider         | -          | group=0,max=0.7,min=-0.7                           | Mirror Slider     | Base      | -         |
| platform       | -          | group=0,dx=-3,dy=0,dtheta=90,offsetX=-1,offsetY=-1 | Platform          | Left      | Center    |
| window         | -          | -                                                  | Glass             | LT        | Center    |
| pulley         | -          | [barWidth]=2.5                                     | Pulley            | Base      | -         |
| hanging        | -          | fullRotation=true,[barWidth]=2.5                   | Hanging Platform  | Base      | -         |
| roman          | -          | -                                                  | Seesaw            | Base      | -         |

### Group Color

0 - white
1 - red
2 - green
3 - blue
4 - yellow
5 - megenta
6 - lightblue
7 - purple
8 - white
9 - white
10 - red
11 - red
12 - red
13 - red
14 - red
...

### Light Source

Default to right.

### Light Receiver

Default to up.

### Boxed Mirror

Default is LT-RB line.

Different groups with the same color do not assocate each other.

### Lever

-1 is left, 1 is right

### Wind

Default to right.

### Mirror Slider

Arg min,max in 90°.

- width: 0
- height: 0
- polyline:
  - [2]:
    - x: -8  // in pixels
    - y: 0   // y is ignored

### Platform

Arg dx, dy in 32x grids.

### Glass

height must be 32.

### Pulley

barWidth in 32x grids.

- width: 0
- height: 0
- polyline:
  - [4]:    // in order LB LT RT RB
    - x: 0  // in pixels
    - y: 0

### Hanging Platform

barWidth in 32x grids.

- width: 0
- height: 0
- polyline:
  - [2]:   // top, spin
    - x: 0
    - y: 0

### Seesaw

polyline:
  - [2]:    // LeftP, RightP
    - x: 0  // in pixels
    - y: 0

Structure
----------

- height: 29
- width: 39   // in 32x grids
- name: '无标题'
- layers: []
  - [[Layer]]
- nextobjectid: 0
- orientation: orthogonal
- renderorder: right-down
- tiledversion: '1.1.3'
- tileheight: 32
- tilewidth: 32
- tilesets:
  - [[TileSet]]
- type: 'map'
- version: 1

### Tileset

- firstgid: 100
- source: '../../../assets/tilemaps/tilesets/Chars.json'

### Layer

**Tiled Layer**

- height: 29
- width: 39  // in 32x grids
- x: 0  // in pixels
- y: 0
- name: 'Ground'
- type: 'tilelayer'
- visible: true  // no use
- opacity: 1
- data: [...]

**Tutorial Layer**

- type: 'objectGroup'
- opacity: 1
- visible: true
- x: 0
- y: 0
- draworder: 'topdown'
- name: 'Tutorial_dual' · 'Tutorial_single' · 'Tutorial_keyboard'
- objects: []
  - [[Detec-door]]
    - width: 464
    - height: 248   // in pixels
    - name: ''
    - properties: [id: 0]
    - propertytypes: [id: 'int']
    - rotation: 0
    - type: ''
    - visible: true
    - x: 16
    - y: 664  // in pixels
  - [[Text]]
    - width: 464
    - height: 248   // in pixels
    - name: ''
    - properties: [id: 0]
    - propertytypes: [id: 'int']
    - rotation: 0
    - type: ''
    - visible: true
    - x: 16
    - y: 664  // in pixels
    - text:
      - bold: true
      - fontfamily: 'Trajan Pro'
      - halign: 'center'
      - pixelsize: 24   // fontsize
      - text: '请用A,W,D键移动“冰女孩”'  // hardcoded only
      - wrap: true

**Chars/Objects**

- type: 'objectGroup'
- opacity: 1
- visible: true
- x: 0
- y: 0
- draworder: 'topdown'
- name: 'Chars' · 'Objects'
- objects: []
  - [[Object]]

**Object**

- [gid]: 213   // defined in tilesets
- id: 1  // no use
- width: 64
- height: 64  // in pixels
- x: 64
- y: 896  // in pixels
- name: ''   // no use
- rotation: 0
- type: ''   // for gid-less components
- visible: true
- properties: {...}
- propertytypes:
  - sample: 'int' · 'bool' · 'string' · 'float'
