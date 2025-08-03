import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'PolicyGlass API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the PolicyGlass application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    paths: {
      '/auth/login': {
        post: {
          operationId: 'loginUser',
          summary: 'User login',
          description: 'Authenticate a user with username/email and password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: {
                      type: 'string',
                      description: 'Username or email for login',
                    },
                    password: {
                      type: 'string',
                      description: 'Password for login',
                    },
                  },
                  required: ['username', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
            },
            '400': {
              description: 'Invalid credentials',
            },
            '401': {
              description: 'Unauthorized - Email not verified',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/auth/register': {
        post: {
          operationId: 'registerUser',
          summary: 'User registration',
          description: 'Register a new user with username, email, and password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: {
                      type: 'string',
                      description: 'Desired username',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'Email address',
                    },
                    password: {
                      type: 'string',
                      description: 'Password',
                    },
                  },
                  required: ['username', 'email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Registration successful',
            },
            '400': {
              description: 'Invalid input data',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          operationId: 'logoutUser',
          summary: 'User logout',
          description: 'Logout the current user and invalidate their session',
          tags: ['Authentication'],
          responses: {
            '200': {
              description: 'Logout successful',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/auth/verify': {
        post: {
          operationId: 'verifyUser',
          summary: 'Verify user session',
          description: 'Verify if the current user has a valid session',
          tags: ['Authentication'],
          responses: {
            '200': {
              description: 'Email verification successful',
            },
            '400': {
              description: 'Invalid verification token',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/auth/password-reset/request': {
        post: {
          operationId: 'requestPasswordReset',
          summary: 'Request password reset',
          description: 'Request a password reset token for a user account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'Email address for password reset',
                    },
                  },
                  required: ['email'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Password reset request processed',
            },
            '400': {
              description: 'Invalid email address',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/auth/password-reset/confirm': {
        post: {
          operationId: 'confirmPasswordReset',
          summary: 'Confirm password reset',
          description: 'Confirm password reset using a reset token and new password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                      description: 'Password reset token',
                    },
                    new_password: {
                      type: 'string',
                      description: 'New password',
                    },
                  },
                  required: ['token', 'new_password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Password reset confirmed successfully',
            },
            '400': {
              description: 'Invalid input data or reset token',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/admin/users': {
        get: {
          operationId: 'getAllUsers',
          summary: 'Get all users',
          description: 'Retrieve a list of all users (admin only)',
          tags: ['Admin'],
          responses: {
            '200': {
              description: 'Users retrieved successfully',
            },
            '403': {
              description: 'Forbidden - Admin access required',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
        put: {
          operationId: 'updateUserRole',
          summary: 'Update user role',
          description: 'Update a user\'s role (admin only)',
          tags: ['Admin'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: {
                      type: 'number',
                      description: 'ID of the user to update',
                    },
                    role: {
                      type: 'string',
                      description: 'New role for the user',
                    },
                  },
                  required: ['userId', 'role'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User role updated successfully',
            },
            '400': {
              description: 'Invalid input data or cannot remove own admin role',
            },
            '403': {
              description: 'Forbidden - Admin access required',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/policy/research': {
        post: {
          operationId: 'researchPolicy',
          summary: 'Research policy terms',
          description: 'Research and store policy terms for a given website URL using AI analysis',
          tags: ['Policy Research'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                      description: 'Website URL to research policy terms for',
                    },
                  },
                  required: ['url'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Policy research completed and stored successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      policyId: {
                        type: 'number',
                        description: 'ID of the stored policy research',
                      },
                      message: {
                        type: 'string',
                        description: 'Success message',
                      },
                    },
                    required: ['policyId', 'message'],
                  },
                },
              },
            },
            '400': {
              description: 'Invalid input data or URL format',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        description: 'Error message',
                      },
                    },
                    required: ['error'],
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                        description: 'Error message',
                      },
                    },
                    required: ['error'],
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Unique identifier of the user',
            },
            username: {
              type: 'string',
              description: 'Username of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
            },
            role: {
              type: 'string',
              description: 'Role of the user (user, admin)',
            },
          },
          required: ['id', 'username', 'email', 'role'],
        },
      },
    },
  };
  
  return NextResponse.json(openApiSpec);
}
