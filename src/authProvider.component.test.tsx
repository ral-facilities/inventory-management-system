import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthorisationState } from './authProvider.component';
import React from 'react';

const localStorageGetItemMock = vi.spyOn(
  window.localStorage.__proto__,
  'getItem'
);

const ConfigTest: React.FC = (): React.ReactElement => {
  const authorisationState = useAuthorisationState();

  // return authorised as a string to inspect later in tests
  return (
    <div data-testid="authorisationState">
      Authorised: {JSON.stringify(authorisationState)}
    </div>
  );
};

describe('AuthProvider', () => {
  // Create wrapper for authorisation tests
  const renderComponent = (): RenderResult =>
    render(
      <AuthProvider>
        <ConfigTest />
      </AuthProvider>
    );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct authorisation state for admin user', async () => {
    // token is `valid access token with admin role`
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOnRydWUsImV4cCI6MjUzNDAyMzAwNzk5fQ.e_yNd4axueRx9_4rG05tWNHiUkwsoZUsNdpl8vb5ofHiFkJAB7D2Gy6NJmg9Pg4fKxpGS-HqRfCjrtQiWX-ZM3UCJ3S468bWk_DEpEeift3wfp8Kmha3iEgAYruMta7RaoWeeyYMVqq581zHhb8zCquMfFz30R-VKZw_MQidvhK1G3QpwAs-kwcCLgugZi3C2kw5JBDm_jQlyyGiK06C_X5c4tGSvpgMFz0ex6gAr6QcEX9kkS7TKrLySoL5DC_ElKrjOs24QhPO2xlKOw82rfJa7wRpARWFdbY0NFy7veAiQfzlfW_9X_Mas2gRMF6tu6pkTnVRoLIv07l-nukjlA'
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(`Authorised: {"role":"admin","isAdminUser":true}`)
      ).toBeInTheDocument();
    });
  });

  it('provides false when user is not admin role', async () => {
    // token is `valid access token with default role`
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImRlZmF1bHQiLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.KRtAMZnaB-CQTDV4PGLgQ3yI-9dzMIy0g3SBaThszSjH-ZaoRTuGuJPXlskhuVMpJ8WEbsim3pNU9gSUD3VuEbFekKSubxeZSqLUQSGmJjLppsPayGgX_SVXyZZYJnnLyTCR2nlC-MGX33PUfjIGWkn3f9kjPUNxN0A6aoVBAhTyxTEw-jBTNRYzrzLTzI_nZ0bN1bx3XcTO6Y19__IwGLFUlBn4wDPj-tL-pJro0qedcCWVRhLoHsyVVGTJJk7AZGda2BKJap2y4Jc7SwcOZ5Uyg0fgbl_SvC9BcLIKEE-c41UiG-cjm0_1Jjb6mZU0FOmHXSuNpSo05E8_Vc6Bzw'
    );

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(`Authorised: {"role":"default","isAdminUser":false}`)
      ).toBeInTheDocument();
    });
  });
});
