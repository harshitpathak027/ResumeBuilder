import { useEffect, useState } from 'react';
import ErrorMessage from '../../app/(tabs)/ErrorMessage';
import { subscribeErrorMessage } from '../../utils/errorMessageBus';

const ErrorMessageHost = () => {
  const [modalState, setModalState] = useState({
    visible: false,
    title: 'Error',
    message: '',
  });

  useEffect(() => {
    const unsubscribe = subscribeErrorMessage(({ title, message }) => {
      setModalState({
        visible: true,
        title: title || 'Error',
        message: message || 'Something went wrong',
      });
    });

    return unsubscribe;
  }, []);

  return (
    <ErrorMessage
      visible={modalState.visible}
      title={modalState.title}
      message={modalState.message}
      onClose={() => setModalState((prev) => ({ ...prev, visible: false }))}
    />
  );
};

export default ErrorMessageHost;
