import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import SimpleImage from "@editorjs/simple-image";
import NestedList from "@editorjs/nested-list";
import Checklist from "@editorjs/checklist";
import LinkTool from "@editorjs/link";
import Table from "@editorjs/table";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import CodeTool from "@editorjs/code";
import RawTool from "@editorjs/raw";
import uploadImage from "../common/aws";

const uploadImageByFile = (file) => {
  return uploadImage(file).then((url) => {
    if (url) {
      return {
        success: 1,
        file: { url },
      };
    }
  });
};

const uploadImageByURL = (url) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(url);
    } catch (err) {
      reject(err);
    }
  }).then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

export const tools = {
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        vimeo: true,
        twitter: true,
        instagram: true,
        twitch: true,
        gfycat: true,
      },
    },
  },
  list: {
    class: NestedList,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  simpleImage: SimpleImage,
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading....",
      levels: [1, 2, 3, 4],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: "Enter a quote",
      captionPlaceholder: "Quote's author",
    },
  },
  marker: Marker,
  inlineCode: InlineCode,
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  linkTool: {
    class: LinkTool,
    config: {
      endpoint: "/fetchUrl", // Replace with your actual backend endpoint for link metadata
    },
  },
  table: {
    class: Table,
    inlineToolbar: true,
  },
  delimiter: Delimiter,
  warning: {
    class: Warning,
    inlineToolbar: true,
    config: {
      titlePlaceholder: "Warning title",
      messagePlaceholder: "Warning message",
    },
  },
  code: CodeTool,
  raw: RawTool,
};
