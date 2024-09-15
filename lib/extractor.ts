import { OPS, PDFDocumentProxy, Util } from 'pdfjs-dist';
import { PDFOperatorList } from 'pdfjs-dist/types/src/display/api';

const getDirection = async function (opList: PDFOperatorList) {
  const verticles = [],
    horizons = [];
  var transformMatrix = [1, 0, 0, 1, 0, 0];
  var transformStack = [];
  // Get rectangle first
  var showed = {};
  var REVOPS = [];
  for (var op in OPS) {
    REVOPS[OPS[op]] = op;
  }

  var strokeRGBColor = null;
  var fillRGBColor = null;
  var current_x, current_y;
  var edges = [];
  var line_max_width = 2;
  var lineWidth = null;
  let x,
    y,
    width,
    height,
    edges1,
    edges2,
    edge,
    new_lines,
    x_list,
    hor,
    col,
    line,
    left_col,
    right_col,
    ver,
    row,
    top_row,
    bottom_row;

  while (opList.fnArray.length) {
    var fn = opList.fnArray.shift();
    var args = opList.argsArray.shift();
    if (OPS.constructPath == fn) {
      while (args[0].length) {
        const op = args[0].shift();
        if (op == OPS.rectangle) {
          x = args[1].shift();
          y = args[1].shift();
          width = args[1].shift();
          height = args[1].shift();
          if (Math.min(width, height) < line_max_width) {
            edges.push({
              y: y,
              x: x,
              width: width,
              height: height,
              transform: transformMatrix,
            });
          }
        } else if (op == OPS.moveTo) {
          current_x = args[1].shift();
          current_y = args[1].shift();
        } else if (op == OPS.lineTo) {
          x = args[1].shift();
          y = args[1].shift();

          if (lineWidth == null) {
            if (current_x == x) {
              edges.push({
                y: Math.min(y, current_y),
                x: Math.min(x, current_x),
                height: Math.abs(y - current_y),
                transform: transformMatrix,
              });
            } else if (current_y == y) {
              edges.push({
                x: Math.min(x, current_x),
                y: Math.min(y, current_y),
                width: Math.abs(x - current_x),
                transform: transformMatrix,
              });
            }
          } else {
            if (current_x == x) {
              edges.push({
                y: Math.min(y, current_y),
                x: x - lineWidth / 2,
                width: lineWidth,
                height: Math.abs(y - current_y),
                transform: transformMatrix,
              });
            } else if (current_y == y) {
              edges.push({
                x: Math.min(x, current_x),
                y: y - lineWidth / 2,
                height: lineWidth,
                width: Math.abs(x - current_x),
                transform: transformMatrix,
              });
            }
          }
          current_x = x;
          current_y = y;
        } else {
          // throw ('constructPath ' + op);
        }
      }
    } else if (OPS.save == fn) {
      transformStack.push(transformMatrix);
    } else if (OPS.restore == fn) {
      transformMatrix = transformStack.pop();
    } else if (OPS.transform == fn) {
      transformMatrix = Util.transform(transformMatrix, args);
    } else if (OPS.setStrokeRGBColor == fn) {
      strokeRGBColor = args;
    } else if (OPS.setFillRGBColor == fn) {
      fillRGBColor = args;
    } else if (OPS.setLineWidth == fn) {
      lineWidth = args[0];
    } else if (['eoFill'].indexOf(REVOPS[fn]) >= 0) {
    } else if ('undefined' === typeof showed[fn]) {
      showed[fn] = REVOPS[fn];
    } else {
    }
  }

  edges = edges.map(function (edge) {
    var point1 = Util.applyTransform([edge.x, edge.y], edge.transform);
    var point2 = Util.applyTransform(
      [edge.x + edge.width, edge.y + edge.height],
      edge.transform,
    );
    return {
      x: Math.min(point1[0], point2[0]),
      y: Math.min(point1[1], point2[1]),
      width: Math.abs(point1[0] - point2[0]),
      height: Math.abs(point1[1] - point2[1]),
    };
  });
  // merge rectangle to verticle lines and horizon lines
  edges1 = JSON.parse(JSON.stringify(edges));
  edges1.sort(function (a, b) {
    return a.x - b.x || a.y - b.y;
  });
  edges2 = JSON.parse(JSON.stringify(edges));
  edges2.sort(function (a, b) {
    return a.y - b.y || a.x - b.x;
  });

  // get verticle lines
  var current_x = null;
  var current_y = null;
  var current_height = 0;
  var lines = [];
  var lines_add_verticle = function (lines, top, bottom) {
    var hit = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].bottom < top || lines[i].top > bottom) {
        continue;
      }
      hit = true;

      top = Math.min(lines[i].top, top);
      bottom = Math.max(lines[i].bottom, bottom);
      let new_lines = [];
      if (i > 1) {
        new_lines = lines.slice(0, i - 1);
      }
      new_lines = new_lines.concat(lines.slice(i + 1));
      lines = new_lines;
      return lines_add_verticle(lines, top, bottom);
    }
    if (!hit) {
      lines.push({ top: top, bottom: bottom });
    }
    return lines;
  };

  while ((edge = edges1.shift())) {
    // skip horizon lines
    if (edge.width > line_max_width) {
      continue;
    }

    // new verticle lines
    if (null === current_x || edge.x - current_x > line_max_width) {
      if (current_height > line_max_width) {
        lines = lines_add_verticle(
          lines,
          current_y,
          current_y + current_height,
        );
      }
      if (null !== current_x && lines.length) {
        verticles.push({ x: current_x, lines: lines });
      }
      current_x = edge.x;
      current_y = edge.y;
      current_height = 0;
      lines = [];
    }

    if (Math.abs(current_y + current_height - edge.y) < 10) {
      current_height = edge.height + edge.y - current_y;
    } else {
      if (current_height > line_max_width) {
        lines = lines_add_verticle(
          lines,
          current_y,
          current_y + current_height,
        );
      }
      current_y = edge.y;
      current_height = edge.height;
    }
  }
  if (current_height > line_max_width) {
    lines = lines_add_verticle(lines, current_y, current_y + current_height);
  }

  // no table
  if (current_x === null || lines.length == 0) {
    return {
      horizons,
      verticles,
    };
  }

  verticles.push({ x: current_x, lines: lines });

  // Get horizon lines
  current_x = null;
  current_y = null;
  var current_width = 0;
  var lines_add_horizon = function (lines, left, right) {
    var hit = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].right < left || lines[i].left > right) {
        continue;
      }
      hit = true;

      left = Math.min(lines[i].left, left);
      right = Math.max(lines[i].right, right);
      new_lines = [];
      if (i > 1) {
        new_lines = lines.slice(0, i - 1);
      }
      new_lines = new_lines.concat(lines.slice(i + 1));
      lines = new_lines;
      return lines_add_horizon(lines, left, right);
    }
    if (!hit) {
      lines.push({ left: left, right: right });
    }
    return lines;
  };

  while ((edge = edges2.shift())) {
    if (edge.height > line_max_width) {
      continue;
    }
    if (null === current_y || edge.y - current_y > line_max_width) {
      if (current_width > line_max_width) {
        lines = lines_add_horizon(lines, current_x, current_x + current_width);
      }
      if (null !== current_y && lines.length) {
        horizons.push({ y: current_y, lines: lines });
      }
      current_x = edge.x;
      current_y = edge.y;
      current_width = 0;
      lines = [];
    }

    if (Math.abs(current_x + current_width - edge.x) < 10) {
      current_width = edge.width + edge.x - current_x;
    } else {
      if (current_width > line_max_width) {
        lines = lines_add_horizon(lines, current_x, current_x + current_width);
      }
      current_x = edge.x;
      current_width = edge.width;
    }
  }
  if (current_width > line_max_width) {
    lines = lines_add_horizon(lines, current_x, current_x + current_width);
  }
  // no table
  if (current_y === null || lines.length == 0) {
    return {};
  }
  horizons.push({ y: current_y, lines: lines });

  var search_index = function (v, list) {
    for (var i = 0; i < list.length; i++) {
      if (Math.abs(list[i] - v) < 5) {
        return i;
      }
    }
    return -1;
  };

  // handle merge cells
  x_list = verticles.map(function (a) {
    return a.x;
  });

  // check top_out and bottom_out
  var y_list = horizons
    .map(function (a) {
      return a.y;
    })
    .sort(function (a, b) {
      return b - a;
    });
  var y_max = verticles
    .map(function (verticle) {
      return verticle.lines[0].bottom;
    })
    .sort()
    .reverse()[0];
  var y_min = verticles
    .map(function (verticle) {
      return verticle.lines[verticle.lines.length - 1].top;
    })
    .sort()[0];
  var top_out = search_index(y_min, y_list) == -1 ? 1 : 0;
  var bottom_out = search_index(y_max, y_list) == -1 ? 1 : 0;

  var verticle_merges = {};
  // skip the 1st lines and final lines
  for (var r = 0; r < horizons.length - 2 + top_out + bottom_out; r++) {
    hor = horizons[bottom_out + horizons.length - r - 2];
    lines = hor.lines.slice(0);
    col = search_index(lines[0].left, x_list);
    if (col != 0) {
      for (var c = 0; c < col; c++) {
        verticle_merges[[r, c].join('-')] = {
          row: r,
          col: c,
          width: 1,
          height: 2,
        };
      }
    }
    while ((line = lines.shift())) {
      left_col = search_index(line.left, x_list);
      right_col = search_index(line.right, x_list);
      if (left_col != col) {
        for (let c = col; c < left_col; c++) {
          verticle_merges[[r, c].join('-')] = {
            row: r,
            col: c,
            width: 1,
            height: 2,
          };
        }
      }
      col = right_col;
    }
    if (col != verticles.length - 1 + top_out) {
      for (let c = col; c < verticles.length - 1 + top_out; c++) {
        verticle_merges[[r, c].join('-')] = {
          row: r,
          col: c,
          width: 1,
          height: 2,
        };
      }
    }
  }

  while (true) {
    var merged = false;
    for (var r_c in verticle_merges) {
      var m = verticle_merges[r_c];
      var final_id = [m.row + m.height - 1, m.col + m.width - 1].join('-');
      if ('undefined' !== typeof verticle_merges[final_id]) {
        verticle_merges[r_c].height += verticle_merges[final_id].height - 1;
        delete verticle_merges[final_id];
        merged = true;
        break;
      }
    }
    if (!merged) {
      break;
    }
  }

  var horizon_merges = {};

  for (var c = 0; c < verticles.length - 2; c++) {
    ver = verticles[c + 1];
    lines = ver.lines.slice(0);
    row = search_index(lines[0].bottom, y_list) + bottom_out;
    if (row != 0) {
      for (var r = 0; r < row; r++) {
        horizon_merges[[r, c].join('-')] = {
          row: r,
          col: c,
          width: 2,
          height: 1,
        };
      }
    }
    while ((line = lines.shift())) {
      top_row = search_index(line.top, y_list);
      if (top_row == -1) {
        top_row = y_list.length + bottom_out;
      } else {
        top_row += bottom_out;
      }
      bottom_row = search_index(line.bottom, y_list) + bottom_out;
      if (bottom_row != row) {
        for (let r = bottom_row; r < row; r++) {
          horizon_merges[[r, c].join('-')] = {
            row: r,
            col: c,
            width: 2,
            height: 1,
          };
        }
      }
      row = top_row;
    }
    if (row != horizons.length - 1 + bottom_out + top_out) {
      for (let r = row; r < horizons.length - 1 + bottom_out + top_out; r++) {
        horizon_merges[[r, c].join('-')] = {
          row: r,
          col: c,
          width: 2,
          height: 1,
        };
      }
    }
  }
  if (top_out) {
    horizons.unshift({ y: y_min, lines: [] });
  }
  if (bottom_out) {
    horizons.push({ y: y_max, lines: [] });
  }

  return {
    horizons,
    verticles,
  };
};

const parseTextContent = async function (content, { horizons, verticles }) {
  const tables = [];
  const table_pos = [];
  for (var i = 0; i < horizons.length - 1; i++) {
    tables[i] = [];
    table_pos[i] = [];
    for (var j = 0; j < verticles.length - 1; j++) {
      tables[i][j] = '';
      table_pos[i][j] = null;
    }
  }
  let item;
  while ((item = content.items.shift())) {
    const x = item.transform[4];
    const y = item.transform[5];

    var col = -1;
    for (var i = 0; i < verticles.length - 1; i++) {
      if (x >= verticles[i].x && x < verticles[i + 1].x) {
        col = i;
        break;
      }
    }
    if (col == -1) {
      continue;
    }
    var row = -1;
    for (var i = 0; i < horizons.length - 1; i++) {
      if (y >= horizons[i].y && y < horizons[i + 1].y) {
        row = horizons.length - i - 2;
        break;
      }
    }
    if (row == -1) {
      continue;
    }

    // if ('undefined' !== typeof merge_alias[row + '-' + col]) {
    //   const id = merge_alias[row + '-' + col];
    //   row = id.split('-')[0];
    //   col = id.split('-')[1];
    // }
    if (null !== table_pos[row][col] && Math.abs(table_pos[row][col] - y) > 5) {
      tables[row][col] += '\n';
    }
    table_pos[row][col] = y;
    tables[row][col] += item.str;
  }

  return tables;
};

export async function extractPdf(doc: PDFDocumentProxy) {
  const pageTables = [];
  const numPages = doc.numPages;
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);

    const operationList = await page.getOperatorList();
    const { verticles, horizons } = await getDirection(operationList);
    const textContents = await page.getTextContent();
    const parseData = await parseTextContent(textContents, {
      verticles,
      horizons,
    });

    pageTables.push({
      page: i,
      tables: parseData,
    });
  }

  return {
    numPages,
    pageTables,
  };
}
