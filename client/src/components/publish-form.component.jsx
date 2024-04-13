import React, { useContext } from 'react';
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from '../common/page-animation';

import { EditorContext } from "../pages/editor.pages";


const PublishForm = () => {
  let { setEditorState } = useContext(EditorContext);
  const handleCloseEvent = () => {
    setEditorState("editor");
  }
  return (
    <AnimationWrapper>
      <section>
        <Toaster />
        <button className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]'
        onClick={handleCloseEvent}>
          <i className="fi fi-br-cross"></i>
        </button>
      </section>
    </AnimationWrapper>
  )
}

export default PublishForm;